import React from "react";
import PropTypes from "prop-types";

class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
    this.toggleOpen = this.toggleOpen.bind(this);
  }

  toggleOpen() {
    this.setState({ isOpen: !this.state.isOpen });
  }

  render() {
    const { isOpen } = this.state;
    const { label, children } = this.props;
    return (
      <div className="dropdown">
        <button type="button" className="dropdown-button" onClick={this.toggleOpen}>
          {label}
        </button>
        {isOpen && <div className="dropdown-menu">{children}</div>}
      </div>
    );
  }
}

Dropdown.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
};

Dropdown.defaultProps = {
  children: null,
};

export default Dropdown;