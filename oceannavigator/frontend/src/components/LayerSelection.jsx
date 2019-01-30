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
    
        this.tabSelect = this.tabSelect.bind(this)
    }
    
    componentDidMount() {
      this._mounted = true;
    }

    componentWillUnmount() {
      this._mounted = false;
    }
    
    tabSelect(selectedKey) {
       
        if (selectedKey === 0) {
            for (i=0; i < 6; i++) {

            }
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
            
            this.setState({
                panels: newPanels,
                buttons: newButtons,
            })
        }
    }
    
    render() {


        return (
            <div className='LayerOptions'>
                <div className='LayerSelection'>
                    <Nav onSelect={this.tabSelect}>
                        <NavItem className={this.state.buttons[0]} eventKey={1}>
                            <div className='vertical'>Foundation</div>
                        </NavItem>
                        <NavItem className={this.state.buttons[1]} eventKey={2}>
                            <div className='vertical'>Environment</div>
                        </NavItem>
                        <NavItem className={this.state.buttons[2]} eventKey={3}>
                            <div className='vertical'>Intelligence</div>
                        </NavItem>
                        <NavItem className={this.state.buttons[3]} eventKey={4}>
                            <div className='vertical'>Derived Products</div>
                        </NavItem>
                        <NavItem className={this.state.buttons[4]} eventKey={5}>
                            <div className='vertical'>Planning Tools</div>
                        </NavItem>
                        
                    </Nav>
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
                                toggleLayer={this.props.toggleLayer}
                                reloadLayer={this.props.reloadLayer}
                                mapComponent={this.props.mapComponent}
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
                                toggleLayer={this.props.toggleLayer}
                                reloadLayer={this.props.reloadLayer}
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
                            <Button className={this.state.buttons[5]} onClick={() => this.tabSelect(6)}>
                                <Icon icon='gear'/>
                            </Button>
                        </div>

                </div>
                
            </div>
        );
    }
}