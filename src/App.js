/*global chrome*/ 

import React, { Component } from 'react';
import './App.css';

import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';


class App extends Component {
  render() {
    return (
      <div className="App">
          {this.props.page==="options"?<Options/>:<Popup/>}
      </div>
    );
  }
}

export default App;

class Options extends Component {
	constructor(props) { 
    	super(props);
    	this.state = { 
        stories:[this.getDefaultStory()]
    	}
	}

	componentDidMount() {
      chrome.storage.sync.get('configDefaults', function(data) {
          if(data && data.configDefaults){

            const tmpConfigDefaults = JSON.parse(JSON.stringify(data.configDefaults));

            tmpConfigDefaults.push(this.getDefaultStory());

            tmpConfigDefaults[0].defaults.push({
              description:"",
              duration:""
            });

            this.setState({
              stories:tmpConfigDefaults
            })
          }
        }.bind(this));	
	} 

  handleStoryChange = (params) => {
    let tmpStories;
        tmpStories = JSON.parse(JSON.stringify(this.state.stories));

        tmpStories[params.index]=params.story;

       if(this.state.stories.length-params.index===1){
        tmpStories[params.index+1]=this.getDefaultStory(); 
       } 

    this.setState({stories:tmpStories});
  }

  handleStoryDelete = (index) => {
   const tmpStories = JSON.parse(JSON.stringify(this.state.stories));
    tmpStories.splice(index,1);
    this.setState({stories:tmpStories});
  }

  getDefaultStory = () =>{
    return { 
          storyId:"",
          random:false,
          select:false,
          defaults:[
            {
              description:"",
              duration:""
            }
          ]
        }
  }

  saveConfig = () =>{
    const stories = this.state.stories.filter(story=>story.storyId!=="" && story.defaults.length>0);
      stories.forEach(story=>{
        story.defaults=story.defaults.filter(defaul=>defaul.description!==""||defaul.duration!=="");    
      })

      chrome.storage.sync.set({configDefaults: stories.filter(story=>story.defaults.length>0)}, function() {
          console.log("SAVED!");
      });

  }

	render() {
		return (
		  <div> 
        {this.state.stories.map((story,i)=><EditorStory key={i} index={i} story={story} storiesLength={this.state.stories.length} handleStoryChange={this.handleStoryChange} handleStoryDelete={this.handleStoryDelete}/>)}
		    
        <div style={{padding:"5px"}}>
        <Button variant="contained" color="primary" onClick={this.saveConfig}>
          Salva configurazione
        </Button>
        </div>

      </div>
		);
	}
}





const EditorStory = (props) => {

  const handleChange = name => event => {
    const tmpStory = JSON.parse(JSON.stringify(props.story));
    tmpStory[name] = event.target.value;
    props.handleStoryChange({story:tmpStory,index:props.index});
   }

   const handleChangeCheckbox = name => event => {    
    const tmpStory = JSON.parse(JSON.stringify(props.story));
    tmpStory[name] = event.target.value==="true"?true:false;
    props.handleStoryChange({story:tmpStory,index:props.index});
  }



  const handleDefaultChange = (params) => {   
    if(params.description==="" && params.duration===""){
      return;
    }

    const tmpStory = JSON.parse(JSON.stringify(props.story));
    const tmpDefaults = JSON.parse(JSON.stringify(tmpStory.defaults));

    tmpDefaults[params.index]=({
      description:params.description,
      duration:params.duration
    });

     if(props.story.defaults.length-params.index ===1){
      tmpDefaults[params.index+1]={description:"", duration:"" };
    }

      tmpStory.defaults = tmpDefaults;

      props.handleStoryChange({story:tmpStory,index:props.index});
  }

  const handleDefaultDelete = (index) => {
    const tmpStory = JSON.parse(JSON.stringify(props.story));
    const tmpDefaults = JSON.parse(JSON.stringify(tmpStory.defaults));
      tmpDefaults.splice(index,1);
      tmpStory.defaults = tmpDefaults;
      props.handleStoryChange({story:tmpStory,index:props.index});
  }


    return (
      <div style={{background:"#f6f6f6",padding:"5px", borderBottom:"2px solid #c6c6c6"}}>

      <div>
           <TextField
            id="storyId"
            label="ID Storia"
            value={props.story.storyId}
            onChange={handleChange('storyId')}
            margin="normal"
          />
        <FormControlLabel
          control={
            <Switch
              checked={props.story.random}
              onChange={handleChangeCheckbox('random')}
              value={props.story.random?"false":"true"} 
            />
          }
          label="Randomizzato"
        />
        <FormControlLabel
          control={
            <Switch
              checked={props.story.select}
              onChange={handleChangeCheckbox('select')}
              value={props.story.select?"false":"true"}
            />
          }
          label="Drop down list"
        />

      </div>

      {props.story.defaults.map((def,i)=><EditorDefaults key={i} index={i} def={def} handleDefaultChange={handleDefaultChange} handleDefaultDelete={handleDefaultDelete}/>)}
            {props.storiesLength>1?
              <IconButton onClick={()=>props.handleStoryDelete(props.index)}>
              <DeleteIcon />
            </IconButton>:null}
      </div>
    );
  
}



const EditorDefaults = (props) => {
  const {def,index,handleDefaultChange,handleDefaultDelete} = props;

  const handleChange = name => event => {

    const description = name==="description"?event.target.value:def.description;
    const duration = name==="duration"?event.target.value:def.duration;


    handleDefaultChange({description,duration,index});
  }

    return (
      <div>
           <TextField
            id="description"
            label="Descrizione"
            value={def.description}
            onChange={handleChange('description')}
            margin="normal"
          />
 
          <TextField
            id="duration"
            label="Durata"
            value={def.duration}
            onChange={handleChange('duration')}
            margin="normal"
          />
          {def.description!=="" || def.duration!=="" ? 
            <IconButton onClick={()=>handleDefaultDelete(index)}>
              <DeleteIcon />
            </IconButton>
          :null}



      </div>
    );
  
}



class Popup extends Component {
  constructor(props) { 
    super(props);
    this.state = { 
      enabled:true,
      useTitle:true
    }
  }

  componentDidMount() {
      chrome.storage.sync.get('settings', function(data) {
        console.log(data);
          if(data && data.settings){
            this.setState({
              enabled:data.settings.enabled,
              useTitle:data.settings.useTitle
            })
          }
        }.bind(this));  
  } 


  handleChangeCheckbox = name => event => {
    this.setState({
      [name]:event.target.value==="true"?true:false
    });
  }

  save = () =>{
    console.log("SAVE");
      chrome.storage.sync.set({settings: {enabled:this.state.enabled,useTitle:this.state.useTitle}}, function() {
          console.log("SAVED!");
      }.bind(this));
  }

  render() {
    return (
      <div style={{padding:"10px", width:"150px"}}>
          <FormControlLabel
          control={
            <Switch
              checked={this.state.enabled}
              onChange={this.handleChangeCheckbox('enabled')}
              value={this.state.enabled?"false":"true"} 
            />
          }
          label="Abilitato"
        />

          <FormControlLabel
          control={
            <Switch
              checked={this.state.useTitle}
              onChange={this.handleChangeCheckbox('useTitle')}
              value={this.state.useTitle?"false":"true"} 
            />
          }
          label="Usa titolo se non matcha"
        />

        <Button variant="contained" color="primary" onClick={this.save}>
          Salva
        </Button>


      </div>
    );
  }
}