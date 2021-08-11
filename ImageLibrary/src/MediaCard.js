import React, {useEffect} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from "@material-ui/core/IconButton";
import {ThumbDownOutlined, ThumbUpOutlined} from "@material-ui/icons";
import PropTypes from "prop-types";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import {apiEndpoint} from "./App";

const useStyles = makeStyles({
    root: {
        //maxWidth: 345,
    },
    media: {
        height: 200,
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default function MediaCard(props) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    let {id, link, votes} = props;
    let [downvoted, setDownVoted] = React.useState(props.downvoted);
    let [upvoted, setUpVoted] = React.useState(props.upvoted);
    let downvotes = new Set();
    let upvotes = new Set();
    let [stateVotes, setStateVotes] = React.useState(votes);

    useEffect(() => {
        setStateVotes(votes);
        setUpVoted(props.upvoted);
        setDownVoted(props.downvoted);
    }, [props])


    function handleUpvote(e) {
        if (!upvoted) {
            if (!downvoted) {
                setUpVoted(true);
                addUpvote();
            } else {
                setDownVoted(false);
                setUpVoted(true);
                addUpvote();
                addUpvote();
            }
        }
    }

    function handleDownvote(e) {
        if (!downvoted) {
            if (!upvoted) {
                setDownVoted(true);
                addDownvote();
            } else {
                setDownVoted(true);
                setUpVoted(false);
                addDownvote();
                addDownvote();
            }
        }
    }

    function addDownvote() {
        if (JSON.parse(localStorage.getItem("downvotes")) !== null) {
            JSON.parse(localStorage.getItem("downvotes")).forEach(el => {
                downvotes.add(el);
                if (el === id) {
                    setDownVoted(true);
                }
            })
        }
        upvotes = new Set();
        if (JSON.parse(localStorage.getItem("upvotes")) !== null) {
            JSON.parse(localStorage.getItem("upvotes")).forEach(el => {
                if (el !== id) {
                    upvotes.add(el);
                }
            })
        }
        downvotes.add(id);
        localStorage.setItem("upvotes", JSON.stringify(Array.from(upvotes)));
        localStorage.setItem("downvotes", JSON.stringify(Array.from(downvotes)));
        fetch(apiEndpoint + '/down', {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id: id}),
        }).then(response => response.json())  // convert to json
            .then(json => {
                votes = json.votes;
                setStateVotes(json.votes);
            })
    }

    function addUpvote() {
        if (JSON.parse(localStorage.getItem("upvotes")) !== null) {
            JSON.parse(localStorage.getItem("upvotes")).forEach(el => {
                upvotes.add(el);
                if (el === id) {
                    setUpVoted(true);
                }
            })
        }
        downvotes = new Set();
        if (JSON.parse(localStorage.getItem("downvotes")) !== null) {
            JSON.parse(localStorage.getItem("downvotes")).forEach(el => {
                if (el !== id) {
                    downvotes.add(el);
                }
            })
        }
        upvotes.add(id);
        localStorage.setItem("downvotes", JSON.stringify(Array.from(downvotes)));
        localStorage.setItem("upvotes", JSON.stringify(Array.from(upvotes)));
        fetch(apiEndpoint + '/up', {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id: id}),
        }).then(response => response.json())  // convert to json
            .then(json => {
                votes = json.votes;
                setStateVotes(json.votes);
            })
    }

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    return (
        <Card className={classes.root}>
            <CardActionArea>
                <CardMedia
                    className={classes.media}
                    image={link}
                    onClick={handleOpen}
                />
            </CardActionArea>
            <CardActions style={{width: "100%"}}>
                <IconButton aria-label="downvote" className={classes.margin} onClick={handleDownvote}
                            color={downvoted ? "secondary" : "default"}>
                    <ThumbDownOutlined/>
                </IconButton>
                <IconButton aria-label="upvote" className={classes.margin} onClick={handleUpvote}
                            color={upvoted ? "primary" : "default"}>
                    <ThumbUpOutlined/>
                </IconButton>
                <p align="right">
                    {stateVotes}
                </p>
            </CardActions>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                open={open}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={open}>
                    <img src={link} alt={id}/>
                </Fade>
            </Modal>
        </Card>
    );
}

MediaCard.propTypes = {
    id: PropTypes.string
};
