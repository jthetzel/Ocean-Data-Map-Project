import React from 'react';
import Icon from "./Icon.jsx";
import { Button, Nav, NavItem, NavLink } from 'react-bootstrap';
import MapInputs from './MapInputs.jsx';
import FoundationTab from './FoundationTab.jsx';
import IntelligenceTab from './IntelligenceTab.jsx';
import DerivedProductsTab from './DerivedProductsTab.jsx';
import PlanningToolsTab from './PlanningToolsTab.jsx';
import SettingsTab from './SettingsTab.jsx';
import EnvironmentTab from './EnvironmentTab.jsx';
import Media from 'react-media';
import sizeMe from 'react-sizeme';

const i18n = require("../i18n.js");

export default class LayerSelection extends React.Component {
    
    constructor(props) {
        super(props);
    
        // Track if mounted to prevent no-op errors with the Ajax callbacks.
        this._mounted = false;
        
        this.state = {
          public: false,
          tab: 2,
          panels: ['hiddenPanel', 'currentPanel', 'hiddenPanel', 'hiddenPanel', 'hiddenPanel', 'hiddenPanel'],
          buttons: ['hiddenButton', 'currentButton', 'hiddenButton', 'hiddenButton', 'hiddenButton', 'hiddenButton']
        };
        
        if (true) {
            this._foundation = true;
            this._environment = true;
            this._intelligence = false;
            this._derived = false;
            this._planning = false;
        } else {
            this._foundation = true;
            this._environment = true;
            this._intelligence = true;
            this._derived = true;
            this._planning = true;
        }

        this.tabSelect = this.tabSelect.bind(this)
        this.toggleScreen = this.toggleScreen.bind(this);
    }
    
    componentDidMount() {
      this._mounted = true;
    }

    componentWillUnmount() {
      this._mounted = false;
    }
    
    tabSelect(selectedKey) {
        console.warn("SELECTED KEY: ", selectedKey)
        console.warn("SELECTED TAB: ", this.state.panels[selectedKey])

        if (this.state.panels[selectedKey - 1] === 'currentPanel' && this.state.buttons[selectedKey - 1] === 'currentButton') {
            //Must also change Map Container Left
            this.props.toggleSidebar();
            //let newPanels = this.state.panels;
            //let newButtons = this.state.buttons;
            //newPanels[selectedKey - 1] = 'hiddenPanel';
            //newButtons[selectedKey - 1] = 'hiddenButton';

            //this.setState({
            //    panels: newPanels,
            //    buttons: newButtons,
           // })
            //return;
        }

        if (selectedKey === 0) {
            this.props.toggleSidebar()
        } else {
            let i;
            let newPanels = []
            let newButtons = []

            for (i=0; i<selectedKey - 1;i++) {
                newPanels[i] = 'hiddenPanel'
                newButtons[i] = 'hiddenButton'
            }
            for (i=selectedKey; i < 6; i++) {
                newPanels[i] = 'hiddenPanel'
                newButtons[i] = 'hiddenButton'
            }

            newPanels[selectedKey - 1] = 'currentPanel'
            if (selectedKey === 6) {
                newButtons[selectedKey - 1] = 'settingsButton'
            } else {
                newButtons[selectedKey - 1] = 'currentButton'
            }
            if (!this.props.sidebarOpen) {
                this.props.toggleSidebar();
            }
            this.setState({
                panels: newPanels,
                buttons: newButtons,
            })
        }
    }

    /*
        Changes Styling depending on screen size
        - Provides support for mobile devices
    */
    toggleScreen(size, e) {
        if (e === false) {
            return;
        }

        this.setState({
            screen: size
        });

        switch (size) {
            case "small":
            this.setState({
                toolbarStyle: {
                    width: '100%',    
                },
            });
                break;
            case "medium":
                this.setState({
                    toolbarStyle: {
                        width: '20%',    
                    },
                });
                break;
            case "large":
                this.setState({
                    toolbarStyle: {
                        width: '20%',    
                    },
                });
                break;
        }
    }
    
    render() {

        let enabled_layers = [];
        
        enabled_layers.push(<NavItem
            key='_toggleSidebar'
            className={'sidebar_toggle'}
            eventKey={0}
        >
            <div className='toggleSidebar'>
                <Icon className='toggleSidebar' icon="bars" />
            </div>
        </NavItem>)
        
        if (this.props.state._foundation === true && this.props.state.allowedTabs['_foundation'] === true) {
            enabled_layers.push(<NavItem key='_foundation' className={this.state.buttons[0]} eventKey={1}>
                <div className='vertical'>{_('Foundation')}</div>
            </NavItem>)
        }
        if (this.props.state._environment === true && this.props.state.allowedTabs['_environment'] === true) {
            enabled_layers.push(<NavItem key='_environment' className={this.state.buttons[1]} eventKey={2}>
                <div className='vertical'>{_("Environment")}</div>
            </NavItem>)
        }
        if (this.props.state._intelligence === true && this.props.state.allowedTabs['_intelligence'] === true) {
            enabled_layers.push(<NavItem key='_contact' className={this.state.buttons[2]} eventKey={3}>
                <div className='vertical'>{_("Intelligence")}</div>
            </NavItem>)
        }
        if (this.props.state._derived === true && this.props.state.allowedTabs['_derived'] === true) {
            enabled_layers.push(<NavItem key='_derived' className={this.state.buttons[3]} eventKey={4}>
                <div className='vertical'>{_("Derived Products")}</div>
            </NavItem>)
        }
        if (this.props.state._planning === true && this.props.state.allowedTabs['_planning']) {
            enabled_layers.push(<NavItem key='_planning' className={this.state.buttons[4]} eventKey={5}>
                <div className='vertical'>{_("Planning Tools")}</div>
            </NavItem>)
        }


        return (
           
            <div className='LayerOptions' style={this.state.toolbarStyle}>
                <Media
                    query="(max-width: 599px)"
                    onChange={(e) => this.toggleScreen('small', e)}
                ></Media>
                <Media
                    query="(max-width: 1199px)"
                    onChange={(e) => this.toggleScreen('medium', e)}
                ></Media>
                <Media
                    query="(min-width: 1200px)"
                    onChange={(e) => this.toggleScreen('large', e)}
                ></Media>
                <div className='LayerSelection'>
                    <Nav key='nav' onSelect={this.tabSelect}>
                        {enabled_layers}  
                    </Nav>
                    <div className='vertical versionNumber'>
                        v 4.0.0
                    </div>
                </div>

                <div className='LayerPanels'>
                    
                    <div className={this.state.panels[0]} id='panel1'>
                        <FoundationTab
                            state={this.props.state}
                            swapViews={this.props.swapViews}
                            changeHandler={this.props.updateState}
                            showHelp={this.props.toggleCompareHelp}
                            options={this.props.state.options}
                            updateOptions={this.props.updateOptions}
                        />
                    </div>
                    <div className={this.state.panels[1]} id='panel2'>
                        <EnvironmentTab
                            state={this.props.state}
                            swapViews={this.props.swapViews}
                            mapComponent={this.props.mapComponent}
                            mapComponent2={this.props.mapComponent2}
                            changeHandler={this.props.updateState}
                            showHelp={this.props.toggleCompareHelp}
                            options={this.props.state.options}
                            updateOptions={this.props.updateOptions}
                        />
                    </div>
                    <div className={this.state.panels[2]} id='panel3'>
                        <IntelligenceTab
                            state={this.props.state}
                            swapViews={this.props.swapViews}
                            mapComponent={this.props.mapComponent}
                            changeHandler={this.props.updateState}
                            showHelp={this.props.toggleCompareHelp}
                            options={this.props.state.options}
                            updateOptions={this.props.updateOptions}
                        />
                    </div>
                    <div className={this.state.panels[3]} id='panel4'>
                        <DerivedProductsTab
                            state={this.props.state}
                            swapViews={this.props.swapViews}
                            changeHandler={this.props.updateState}
                            showHelp={this.props.toggleCompareHelp}
                            options={this.props.state.options}
                            updateOptions={this.props.updateOptions}
                        />
                    </div>
                    <div className={this.state.panels[4]} id='panel5'>
                        <PlanningToolsTab
                            state={this.props.state}
                            swapViews={this.props.swapViews}
                            changeHandler={this.props.updateState}
                            showHelp={this.props.toggleCompareHelp}
                            options={this.props.state.options}
                            updateOptions={this.props.updateOptions}
                        />
                    </div>
                    <div className={this.state.panels[5]} id='panel6'>
                        <SettingsTab
                            state={this.props.state}
                            swapViews={this.props.swapViews}
                            changeHandler={this.props.updateState}
                            showHelp={this.props.toggleCompareHelp}
                            options={this.props.state.options}
                            updateOptions={this.props.updateOptions}
                        />
                    </div>                        
                    <div className='settings'>
                        <div className='analyticsDisclaimer' style={{width: '75%', float: 'left'}}>
                            This website uses Google Analytics. By continuing, you accept the usage of cookies.
                            <br />
                            <a href='https://www.wikihow.com/Disable-Cookies'>How to disable Cookies</a>
                        </div>
                        <Button key='settingsButton' style={{width: '25%'}} className={this.state.buttons[5]} onClick={() => this.tabSelect(6)}>
                            <Icon icon='gear'/>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}