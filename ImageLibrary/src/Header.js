import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import DropzoneDialogExample from "./Dropzone";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import {apiEndpoint} from "./App";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";

const useStyles = makeStyles((theme) => ({
    toolbar: {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    toolbarTitle: {
        flex: 1,
    },
    toolbarSecondary: {
        justifyContent: 'space-between',
        overflowX: 'auto',
    },
    toolbarLink: {
        padding: theme.spacing(1),
        flexShrink: 0,
    },
}));

export default function Header(props) {
    const classes = useStyles();
    let {title, page} = props;
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [portalUrl, setPortalUrl] = React.useState("https://siasky.net");

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (event) => {
        setAnchorEl(null);
        let query = "/images?";
        if (event.target.textContent === "Top") {
            query += "sort=top&";
        } else {
            query += "sort=new&";
        }
        query += "page=";
        if (page === undefined) {
            page = 1;
        }


        fetch(apiEndpoint + query + page)
            // Handle success
            .then(response => response.json())  // convert to json
            .then(json => {
                let tempImages = json.results;
                tempImages.forEach(el => {
                    el.xs = props.getSize()
                })
                props.setImages(tempImages);
                props.setPageMax(json.totalPages);
                props.setPage(1);
            })    //print data to console
            .catch(err => console.log('Request Failed', err)); // Catch errors*/
    };

    function handlePortalChange(e) {
        setPortalUrl(e.target.value);
    }

    return (
        <React.Fragment>
            <Toolbar className={classes.toolbar}>
                <Button aria-controls="menu" aria-haspopup="true" onClick={handleClick}>
                    Menu
                </Button>
                <Menu
                    id="menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem onClick={handleClose}>Top</MenuItem>
                    <MenuItem onClick={handleClose}>Latest</MenuItem>
                </Menu>
                <Typography
                    component="h2"
                    variant="h5"
                    color="inherit"
                    align="center"
                    noWrap
                    className={classes.toolbarTitle}
                >
                    {title}
                </Typography>
                <FormControl>
                    <InputLabel>Portal</InputLabel>
                    <Select
                        id="portal-select"
                        value={portalUrl}
                        onChange={handlePortalChange}
                    >
                        <MenuItem value={"https://siasky.net"}>SiaSky</MenuItem>
                        <MenuItem value={"https://SkyPortal.xyz"}>SkyPortal</MenuItem>
                    </Select>
                </FormControl>
                <DropzoneDialogExample portalUrl={portalUrl}/>
            </Toolbar>
        </React.Fragment>
    );
}

Header.propTypes = {
    title: PropTypes.string,
};