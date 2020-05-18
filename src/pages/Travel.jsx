import React, {Component} from 'react';
import TravelInterface from "../components/TravelInterface";
import TravelScene from "../components/TravelScene";

import {randomEvents} from "../data/randomEvents.json";
import {Redirect} from "react-router-dom";

const randomEventChance = 0.2;

const walkingTime = 3;
let walkingTimer;



class Travel extends Component {
  constructor() {
    super();
    this.state = {
      walking: false,
      walkingDistance: 0,
      requestingStop: false,
      eventSequence: [],
      hordeAlive: true,
      redirectURL: null,
    }
  }


  componentDidMount() {
    this.setupEventSequence();
  }

  componentWillUnmount() {
    clearTimeout(walkingTimer);
  }


  setupEventSequence = () => {
    const {nextLocation, distanceTraveled} = this.props;
    let {eventSequence, walking} = this.state;

    if((nextLocation.distanceFromStart - nextLocation.distanceFromPrevious) === distanceTraveled){
      if(nextLocation.eventOnLeaving)
        eventSequence = nextLocation.eventOnLeaving;
    }
    else{
      if(nextLocation.eventOnWalking[0]){
        eventSequence = nextLocation.eventOnWalking[0];
      }
      else{
        walking = true;
      }
    }

    this.setState({walking: walking, eventSequence: eventSequence}, this.checkNextEvent);
  }


  //Lance la marche de la Horde.
  startWalking = () => {
    const {nextLocation} = this.props;
    let {walking, walkingDistance, eventSequence} = this.state;
    walking = true;
    walkingDistance = this.getWalkingDistance();

    if(walkingDistance < this.getRemainingDistance()){

      for(let i = 0; i < nextLocation.eventOnWalking.length; i++){
        if(nextLocation.eventOnWalking[i][0]){
          eventSequence = nextLocation.eventOnWalking[i];
          break;
        }
      }

      if(!eventSequence[0])
        eventSequence = [this.getRandomEvent()];
    }
    else{
      eventSequence = nextLocation.eventOnArriving;
    }

    this.setState(
      {walking: walking, walkingDistance: walkingDistance, eventSequence: eventSequence},
      () => walkingTimer = window.setTimeout(this.stopWalking, walkingTime * 1000));
  }


  //Stop la marche de la Horde.
  stopWalking = () => {
    let {walking} = this.state;
    walking = false;
    this.setState({walking: walking}, this.addDistanceTraveled);
  }


  //Ajoute la distance parcourue lors du tour, puis appelle la fonction chargée de gérer les événements aléatoires.
  addDistanceTraveled = () => {
    console.log(this.state.walking);
    let {walkingDistance, eventSequence} = this.state;
    //this.props.addDistanceTraveled(walkingDistance, this.checkNextEvent());

    if(!eventSequence[0]){
      walkingTimer = window.setTimeout(() => this.props.takeTurn(walkingDistance, this.checkNextEvent()), 1000);
    }
    else{
      this.props.takeTurn(walkingDistance, this.checkNextEvent);
    }
  }


  //Vérifie la présence d'un événement.
  checkNextEvent = () => {
    let {requestingStop, eventSequence, walking} = this.state;

    if(!eventSequence[0]){
      if(this.getWalkingDistance() <= 0){
        this.props.reachLandmark();
        //this.quitWalking('/stop/');
      }
      else{
        if(requestingStop){
          this.quitWalking('/stop/horde');
        }
        else{
          walking = false;
          this.startWalking();
        }
      }
    }
    else{
      this.applyEvent();
    }
  }


  applyEvent = () => {
    console.log('Apply event');
    let {eventSequence} = this.state;
    const {horde, hurtMember} = this.props;


    if(eventSequence[0].damage){
      //let victimIndex = this.getRandomInt(horde.members.length);
      let victimIndex = this.getVictimIndex();
      console.log('test');
      let memberAlive = hurtMember(victimIndex, eventSequence[0].damage);
      if(!memberAlive){
        this.checkHordeHealth();
      }
      let victim = horde.members[victimIndex];
      eventSequence[0].message = eventSequence[0].message.replace(/%victim%/, victim.firstname);

    }

    this.setState({eventSequence: eventSequence});
  }


  getVictimIndex = () => {
    const {horde} = this.props;
    let victimIndex = this.getRandomInt(horde.members.length);
    if(horde.members[victimIndex].health <= 0){
      for(let i = 0; i < (horde.members.length - 1); i++){
        let newVictimIndex = (victimIndex + i) % horde.members.length;
        if(horde.members[newVictimIndex].health > 0){
          victimIndex = newVictimIndex;
          break;
        }
      }
    }
    return victimIndex;
  }


  removeEvent = () => {
    let {eventSequence, redirectURL} = this.state;
    if(!eventSequence[0].gameover){
      eventSequence.shift();
      this.setState({eventSequence: eventSequence}, this.checkNextEvent);
    }
    else{
      redirectURL = '/defeat';
      this.setState({redirectURL});
    }
  }


  //Calcule et renvoit la cadence de marche réelle, avec bonus/malus.
  getWalkingDistance = () => {
    let {horde} = this.props;
    let walkingDistance = Math.min(this.getRemainingDistance(), horde.pacing);

    return walkingDistance;
  }


  //Fait la demande d'un arrêt. Si la Horde est en marche, il faudra attendre la fin de la marche pour que l'arrêt soit effectif.
  requestStop = () => {
    let {walking, requestingStop, eventSequence} = this.state;
    if(!walking && !eventSequence[0]){
      this.quitWalking('/stop/horde');
    }
    else{
      requestingStop = true;
      this.setState({requestingStop: requestingStop});
    }
  }


  //Redirige la navigation vers une autre page.
  quitWalking = (url) => {
    this.props.redirectTo(url);
  }


  //Renvoit la distance entre la Horde et l'étape suivante.
  getRemainingDistance = () => {
    let {distanceTraveled, nextLocation} = this.props;
    return nextLocation.distanceFromStart - distanceTraveled;
  }


  checkHordeHealth = () => {
    let {hordeAlive} = this.state;
    const {horde} = this.props;
    let test = horde.members.find(member => member.health > 0);
    if(test === undefined){
      hordeAlive = false;
      this.setState({hordeAlive}, this.hordeAllDead);
    }
  }


  hordeAllDead = () => {
    let {eventSequence} = this.state;
    let newEvent = {
      message: "Le dernier Hordier a succombé à la force des éléments. Ici s'arrête le voyage de la 34ème Horde du Contrevement...",
      gameover: true,
    }
    eventSequence[1] = newEvent;

    this.setState(eventSequence);
  }


  getRandomEvent = () => {
    if(Math.random() >= randomEventChance)
      return randomEvents[this.getRandomInt(randomEvents.length)];

    return null;
  }


  getRandomInt = (max) => {
    return Math.floor(
      Math.random() * max
    );
  }





  render() {
    const {eventSequence, walking, redirectURL} = this.state;
    const {horde, inventory, nextLocation, distanceTraveled, progressIndex} = this.props;

    return (
      <div className={`page page--travel ${progressIndex < 2 ? 'page--travel--noStopAllowed' : ''}`}>
        <TravelScene
          walkingTime={walkingTime}
          horde={horde}
          event={eventSequence[0]}
          nextLocation={nextLocation}
          distanceTraveled={distanceTraveled}
          walking={walking}
          removeEvent={() => this.removeEvent()}
          progressIndex={progressIndex}
        />
        <TravelInterface
          inventory={inventory}
          horde={horde}
          requestStop={() => this.requestStop()}
          nextLocation={nextLocation}
          distanceTraveled={distanceTraveled}
        />

        {redirectURL ? <Redirect to={redirectURL}/> : null}
      </div>
    );
  }
}

export default Travel;