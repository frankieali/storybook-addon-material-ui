import React from 'react';
import PropTypes from 'prop-types';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme'; // eslint-disable-line
import * as beauti from 'js-beautify';

import { EVENT_ID_INIT, EVENT_ID_DATA } from '../';
import ThemePanel from '../components/ThemePanel';

const { document, window } = global;
const logger = console;

const PROGRESS_STATUS = {
    'button-clone': 'soon', // todo: [] button_clone
    'button-download': 'done', // todo: [x] button_download
    'button-clean': 'soon', // todo: [] button_clean
    'textarea-edit': 'done', // todo: [x] textarea-edit
    'textarea-update': 'done', // todo: [x] textarea-update
};

const progressInfo = () => {
    const keys = Object.keys(PROGRESS_STATUS);
    logger.group('PROGRESS_STATUS:');
    keys.forEach((val) => {
        if (PROGRESS_STATUS[val] === 'done') {
            logger.info(`${val}: ${PROGRESS_STATUS[val]}`);
            return;
        }
        logger.warn(`${val}: ${PROGRESS_STATUS[val]}`);
    });
    logger.groupEnd('PROGRESS_STATUS:');
};


const propTypes = {
    channel: PropTypes.object.isRequired,
    api: PropTypes.object.isRequired,
};


export default class PanelContainer extends React.Component {
    constructor(props, ...args) {
        super(props, ...args);

        this.state = {
            isReady: false,
            isThemeInvalid: false,
            isThemeEditing: false,
            themeString: '',
        };
        this.isChannelData = false;

        // future: get from state with own theme ind
        this.muiTheme = getMuiTheme(lightBaseTheme);

        this.onInitChannel = this.onInitChannel.bind(this);
        this.onDataChannel = this.onDataChannel.bind(this);
        this.onThemeSelect = this.onThemeSelect.bind(this);
        this.onChangeTheme = this.onChangeTheme.bind(this);
        this.onThemeEditing = this.onThemeEditing.bind(this);
        this.onToggleSideBar = this.onToggleSideBar.bind(this);
        this.onDnLoadTheme = this.onDnLoadTheme.bind(this);
        this.onCloneTheme = this.onCloneTheme.bind(this);
        this.onCleanTheme = this.onCleanTheme.bind(this);

        this.dataChannelSend = this.dataChannelSend.bind(this);
        this.queryFetch = this.queryFetch.bind(this);
        this.querySet = this.querySet.bind(this);
        this.getCurrentTheme = this.getCurrentTheme.bind(this);
    }

    componentDidMount() {
        this.props.channel.on(EVENT_ID_INIT, this.onInitChannel);
        this.props.channel.on(EVENT_ID_DATA, this.onDataChannel);
    }

    componentWillUpdate(nextProps, nextState) {
//        if (!this.isChannelData) this.props.channel.emit(EVENT_ID_DATA, nextState);
        this.querySet(nextState);
        this.dataChannelSend(nextState);
        this.isChannelData = false;
    }

    componentWillUnmount() {
        this.props.channel.removeListener(EVENT_ID_INIT, this.onInitChannel);
        this.props.channel.removeListener(EVENT_ID_DATA, this.onDataChannel);
    }

    onInitChannel(initData) {
        const themesNameList = this.genNameList(initData.themesAppliedList);
        const queryData = this.queryFetch();
        this.setState(
            { ...initData, ...queryData, themesNameList, isReady: true },
        );
    }

    onDataChannel(stateData) {
//        const stateData = JSON.parse(strData);
        const themesNameList = this.genNameList(stateData.themesAppliedList);
        this.isChannelData = true; // note: this state received by channel, don't need to send back
        this.setState(
            { ...stateData, themesNameList },
        );
    }

    onThemeSelect(ind) {
        this.setState({
            themeInd: ind,
        });
    }

    onChangeTheme(event) {
        const str = event.target.value;
        try {
            const newTheme = JSON.parse(str);
            const themesAppliedList = this.state.themesAppliedList;
            themesAppliedList[this.state.themeInd] = newTheme;
            this.setState({
                themesAppliedList,
                isThemeInvalid: false,
                themeString: str,
            });
        } catch (e) {
            this.setState({
                isThemeInvalid: true,
                themeString: str,
            });
        }
    }

    onThemeEditing(isFocus) {
        return () => this.setState({
            isThemeEditing: isFocus,
            themeString: this.getCurrentTheme(1),
        });
    }

    onToggleSideBar(f) {
        this.setState({
            isSideBarOpen: f,
        });
    }

    onDnLoadTheme() {
        const uri = `data:application/json;charset=utf-8;base64,
${window.btoa(this.getCurrentTheme(4))}`;
        const fileName = this.state.themesAppliedList[this.state.themeInd]
            .themeFile || 'theme.json';
        const downloadTheme = document.createElement('a');
        downloadTheme.href = uri;
        downloadTheme.download = fileName;

        document.body.appendChild(downloadTheme);
        downloadTheme.click();
        document.body.removeChild(downloadTheme);
    }

    onCloneTheme() {
        progressInfo(this);
        return null;

//        const themesAppliedList = this.state.themesAppliedList;
//        const newTheme = Object.assign({}, themesAppliedList[this.state.themeInd]); // fixme:  deeper
//        newTheme.themeName = `${themesAppliedList[this.state.themeInd].themeName} clone`;
//        newTheme.themeFile = `${themesAppliedList[this.state.themeInd].themeFile}.clone`;
//        const newAppliedList = themesAppliedList.slice(0, this.state.themeInd + 1)
//            .concat(newTheme, themesAppliedList.slice(this.state.themeInd + 1));
//        const themesNameList = this.genNameList(newAppliedList);
//        logger.log(themesNameList);
//        this.setState({ themesAppliedList: newAppliedList, themesNameList });
    }

    onCleanTheme() {
        progressInfo(this);
        return null;

//        const themesAppliedList = this.state.themesAppliedList;
//        const newTheme = {};
//        newTheme.themeName = themesAppliedList[this.state.themeInd].themeName;
//        newTheme.themeFile = themesAppliedList[this.state.themeInd].themeFile;
//        themesAppliedList[this.state.themeInd] = newTheme;
//        const themesNameList = this.genNameList(themesAppliedList);
//        this.setState({ themesAppliedList, themesNameList });
    }

    dataChannelSend(data) {
        if (this.isChannelData) return false;
        this.props.channel.emit(EVENT_ID_DATA, data);
        return true;
    }

    queryFetch() {
        const themeInd = this.props.api.getQueryParam('theme-ind');
        const isSideBarOpen = this.props.api.getQueryParam('theme-sidebar');
        const isFullTheme = this.props.api.getQueryParam('theme-full');
        const data = JSON.parse(JSON.stringify({ themeInd, isSideBarOpen, isFullTheme }));
        const keys = Object.keys(data);
        keys.forEach((val) => {
            data[val] = JSON.parse(data[val]);
        });
        return (data);
    }

    querySet(state) {
        if (state.isReady) {
            const { themeInd, isSideBarOpen, isFullTheme } = state;
            const queryParams = {
                'theme-ind': themeInd,
                'theme-sidebar': isSideBarOpen,
                'theme-full': isFullTheme,
            };
            this.props.api.setQueryParams(queryParams);
        }
    }


    genNameList(themesAppliedList) {
        return themesAppliedList.map((val, ind) => (val.themeName || `Theme ${ind + 1}`));
    }

    getCurrentTheme(indent = 2) {
        return beauti.js_beautify(
            JSON.stringify(this.state.themesAppliedList[this.state.themeInd]),
            {
                indent_size: indent,
                indent_char: ' ',
                eol: '\n',
                end_with_newline: true,
            },
        );
    }

    render() {
        return this.state.isReady ?
        (
          <MuiThemeProvider muiTheme={this.muiTheme}>
            <ThemePanel
              themesNameList={this.state.themesNameList}
              defautThemeInd={this.state.themeInd}
              isSideBarOpen={this.state.isSideBarOpen}
              onThemeSelect={this.onThemeSelect}
              onToggleSideBar={this.onToggleSideBar}
              themeJSON={
                (this.state.isThemeInvalid || this.state.isThemeEditing) ?
                    this.state.themeString : this.getCurrentTheme(1)
              }
              isThemeInvalid={this.state.isThemeInvalid}
              onThemeEditing={this.onThemeEditing}
              onChangeTheme={this.onChangeTheme}
              onDnLoadTheme={this.onDnLoadTheme}
              onCloneTheme={this.onCloneTheme}
              onCleanTheme={this.onCleanTheme}
            />
          </MuiThemeProvider>
        ) : (
          <div
            style={{
                padding: 16,
                fontFamily: '"San Francisco", Roboto, "Segoe UI", "Helvetica Neue", "Lucida Grande", sans-serif',
                color: 'rgb(68, 68, 68)',
            }}
          >
              waiting for muiTheme decorator...
          </div>
        );
    }
}

PanelContainer.propTypes = propTypes;
