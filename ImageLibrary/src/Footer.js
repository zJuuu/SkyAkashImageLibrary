import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            <Link color="inherit" href="https://twitter.com/zJu_u">
                unstoppable(?) image library
            </Link>
        </Typography>
    );
}

const useStyles = makeStyles((theme) => ({
    footer: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(6, 0),
    },
}));

export default function Footer(props) {
    const classes = useStyles();

    return (
        <footer className={classes.footer}>
            <Container maxWidth="lg">
                {/*<Typography variant="subtitle1" align="center" color="textSecondary" component="p">
                    unstoppable image library
                </Typography>*/}
                <Copyright/>
            </Container>
        </footer>
    );
}

Footer.propTypes = {
    description: PropTypes.string,
    title: PropTypes.string,
};