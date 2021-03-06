import React, {Component} from 'react';

class Btn extends Component {


  render() {
    const {title, action} = this.props;

    return (
      <button className={`btn btn--oldSchool ${!action ?'btn--oldSchool--unavailable' : ''}`} onClick={() => action()}>
        {title}
      </button>

    );
  }
}

export default Btn;