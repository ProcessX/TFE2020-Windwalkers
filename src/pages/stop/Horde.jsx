import React, {Component} from 'react';
import Btn from "../../components/Btn";
import {Link, Redirect} from 'react-router-dom';
import Campfire from "../../components/Campfire";
import TutorialPanel from "../../components/tutorialPanel";

class Horde extends Component {
  constructor() {
    super();
    this.state={
      redirectURL: null,
    }
  }

  redirectTo = (url) => {
    let {redirectURL} = this.state;
    redirectURL = url;
    this.setState({redirectURL});
  }


  render() {
    const {horde, redirectTo, tutorial, validateTutorial} = this.props;
    const {redirectURL} = this.state;

    const iconBaseURL = `${process.env.PUBLIC_URL}/assets/icons`;

    const campIcon = {
      backgroundImage: `url(${iconBaseURL}/Icon-Fire.png)`,
    }

    const resourcesIcon = {
      backgroundImage: `url(${iconBaseURL}/Icon-Resources.png)`,
    }

    const hordeIcon = {
      backgroundImage: `url(${iconBaseURL}/Icon-Horde.png)`,
    }

    return (
      <div className={'page page--managementSection page--horde'}>

        {tutorial.horde[0] ? <TutorialPanel content={tutorial.horde[0]} validateTutorial={() => validateTutorial()}/> : null}

        <div className={'managementSection__content'}>

          <h2 className={'title title--size1 title--center managementSection__title'}>Horde</h2>

          <nav className={'managementSection__menu'}>
            <ul className={'menu__btn__li'}>
              <li className={'menu__btn__el menu__btn__el--portraitOnly'}>
                <Btn
                  title={'Santé'}
                  action={() => this.redirectTo('/game/stop/horde/campfire')}
                />
              </li>

              <li className={'menu__btn__el'}>
                <Btn
                  title={'Repos'}
                  action={() => this.redirectTo('/game/stop/horde/rest')}
                />
              </li>

              <li className={'menu__btn__el'}>
                <Btn
                  title={'Soigner'}
                />
              </li>

              <li className={'menu__btn__el'}>
                <Btn
                  title={'Cadence'}
                />
              </li>
            </ul>
          </nav>

          <div className={'managementSection__rightPanel'}>
            <Campfire horde={horde}/>
          </div>

        </div>

        <nav className={'managementSection__navbar'}>
          <ul className={'navbar__link__li'}>
            {/*}
            <li className={`navbar__link__el`}>
              <Link className={`navbar__link ${tutorial.landmark[0] ? 'navbar__link--tuto' : ''}`} to={'/stop/landmark'}>Lieu</Link>
            </li>
            {*/}
            <li className={`navbar__link__el navbar__link__el--active`}>
              <Link className={`navbar__link navbar__link--active`} to={'/game/stop/horde'}>Horde</Link>
              <div className={'navbar__link__illu pixelArt'} style={hordeIcon}></div>
            </li>
            <li className={`navbar__link__el`}>
              <Link className={`navbar__link ${tutorial.resources[0] ? 'navbar__link--tuto' : ''}`}  to={'/game/stop/resources'}>Matériel</Link>
              <div className={'navbar__link__illu pixelArt'} style={resourcesIcon}></div>
            </li>
            <li className={`navbar__link__el`}>
              <Link className={`navbar__link ${tutorial.camp[0] ? 'navbar__link--tuto' : ''}`}  to={'/game/stop/camp'}>Camp</Link>
              <div className={'navbar__link__illu pixelArt'} style={campIcon}></div>
            </li>
            <li className={'navbar__link__el  navbar__link__el--toOptions'}>
              <Link className={'navbar__link navbar__link--toOptions pixelArt'}  to={'/game/options'}>Options</Link>
            </li>
          </ul>
        </nav>

        {redirectURL ? <Redirect to={redirectURL}/> : null}

      </div>
    );
  }
}

export default Horde;