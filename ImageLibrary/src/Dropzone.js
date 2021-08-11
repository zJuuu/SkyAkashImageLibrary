import React, { Component } from 'react'
import {DropzoneDialog} from 'material-ui-dropzone'
import Button from '@material-ui/core/Button';
import { SkynetClient } from "skynet-js";
import {apiEndpoint} from "./App";
import Modal from "@material-ui/core/Modal";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";


export default class DropzoneDialogExample extends Component {
    client = new SkynetClient(this.props.portalUrl);
    constructor(props) {
        super(props);
        this.state = {
            saving:false,
            open: false,
            files: []
        };
    }

    handleClose() {
        this.setState({
            open: false
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.client = new SkynetClient(this.props.portalUrl);
    }

    async handleSave(files) {
        let _this = this;
        this.setState({
            saving: true
        });
        await this.uploadExample(files[0]).then(async function (resp){
            //console.log(resp);
            let url = await _this.client.getSkylinkUrl(resp.toString());
            return url;
        }).then(el => {
            let obj = {link: el};
            fetch(apiEndpoint+'/addimage', {
                method: "POST",
                body: JSON.stringify(obj),
                headers: {"Content-type": "application/json; charset=UTF-8"}
            })

            this.setState({
                saving:false,
                files: files,
                open: false
            });
        })
    }

    handleOpen() {
        this.setState({
            open: true,
        });
    }

    async uploadExample(file) {
        try {
            const { skylink } = await this.client.uploadFile(file);
            return skylink;
        } catch (error) {
            console.log(error)
        }
    }

    render() {
        return (
            <div>
                <Button variant="outlined" size="small" onClick={this.handleOpen.bind(this)}>
                    Upload Image
                </Button>
                <DropzoneDialog
                    open={this.state.open}
                    onSave={this.handleSave.bind(this)}
                    acceptedFiles={['image/jpeg', 'image/png']}
                    showPreviews={true}
                    filesLimit={1}
                    maxFileSize={3000000}
                    onClose={this.handleClose.bind(this)}
                />
                <Modal
                    open={this.state.saving}
                >
                    <Grid
                        container
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justify="center"
                        style={{ minHeight: '100vh'}}
                    >

                        <Grid item xs={9}>
                            <CircularProgress color="secondary" />
                        </Grid>

                    </Grid>
                </Modal>
            </div>
        );
    }
}