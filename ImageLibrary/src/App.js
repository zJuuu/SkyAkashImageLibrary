import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Header from './Header';
import Footer from './Footer';
import './App.css';
import MediaCard from "./MediaCard";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from "@material-ui/core/Button";

export const apiEndpoint = process.env["REACT_APP_API"];

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            pageMax: 1,
            images: [],
            downvotes: null,
            upvotes: null,
            menu: "",
            query: "/images?sort=top&page="
        }
        this.handlePageChange = this.handlePageChange.bind(this);
        this.setMenu = this.setMenu.bind(this);
        this.setQuery = this.setQuery.bind(this);
        this.setImages = this.setImages.bind(this);
        this.setPageMax = this.setPageMax.bind(this);
        this.downvoted = this.downvoted.bind(this);
        this.upvoted = this.upvoted.bind(this);
        this.setPage = this.setPage.bind(this);
    }

    componentDidMount() {
        fetch(apiEndpoint + this.state.query + this.state.page)
            // Handle success
            .then(response => response.json())  // convert to json
            .then(json => {
                //console.log(json);
                let tempImages = json.results;
                tempImages.forEach(el => {
                    el.xs = this.getSize()
                })
                this.setState({
                    images: tempImages,
                    pageMax: json.totalPages,
                    downvotes: JSON.parse(localStorage.getItem("downvotes")),
                    upvotes: JSON.parse(localStorage.getItem("upvotes"))
                })
            })    //print data to console
            .catch(err => console.log('Request Failed', err)); // Catch errors
    }

    downvoted(id) {
        if (localStorage.getItem("downvotes") !== null) {
            let tempDown = JSON.parse(localStorage.getItem("downvotes"));
            let is = false;
            tempDown.forEach(function (item) {
                if (item === id) {
                    is = true;
                }
            });
            return is;
        } else {
            return false;
        }
    }

    upvoted(id) {
        if (localStorage.getItem("upvotes") !== null) {
            let tempUp = JSON.parse(localStorage.getItem("upvotes"));
            let is = false;
            tempUp.forEach(function (item) {
                if (item === id) {
                    is = true;
                }
            });
            return is;
        } else {
            return false;
        }
    }

    handlePageChange(value) {
        this.setState({
            page: value
        })
        fetch(apiEndpoint + this.state.query + value)
            // Handle success
            .then(response => response.json())  // convert to json
            .then(json => {
                let tempImages = this.state.images;
                json.results.forEach(el => {
                    el.xs = this.getSize();
                    tempImages.push(el);
                })
                return (tempImages);
            })
            .then(images => {
                let tempImgSet = new Set();
                this.state.images.forEach(el => {
                    tempImgSet.add(el);
                })
                images.forEach(el => {
                    tempImgSet.add(el);
                })
                this.setState({
                    images: Array.from(tempImgSet)
                })
            })
            .catch(err => console.log('Request Failed', err)); // Catch errors
    };

    getSize() {
        if (Math.floor(Math.random() * 10) <= 6) {
            return 4;
        } else {
            return 4;
        }
    }

    setMenu(value) {
        this.setState({
            menu: value
        })
    }

    setImages(newImages) {
        this.setState({
            images: newImages
        })
    }

    setPageMax(count) {
        this.setState({
            pageMax: count
        })
    }

    setQuery(newQuery) {
        this.setState({
            query: newQuery
        })
    }

    setPage(newPage) {
        this.setState({
            page: newPage
        })
    }

    render() {
        return (
            <React.Fragment>
                <CssBaseline/>
                <Container maxWidth="lg">

                    <Header title="SkyAkash Image Library"
                            menu={this.state.menu}
                            setMenu={this.setMenu}
                            setImages={this.setImages}
                            setPageMax={this.setPageMax}
                            setQuery={this.setQuery}
                            getSize={this.getSize}
                            setPage={this.setPage}
                    />
                    <main>
                        <Grid container justifyContent="center" alignItems="center" spacing={3}>
                            {this.state.images.map(el => {
                                return (
                                    <Grid key={el._id} item xs={4}>
                                        <MediaCard
                                            id={el._id}
                                            link={el.link}
                                            votes={el.votes}
                                            upvoted={this.upvoted(el._id)}
                                            downvoted={this.downvoted(el._id)}/>
                                    </Grid>
                                )
                            })
                            }
                        </Grid>
                    </main>
                    {this.state.page < this.state.pageMax ?
                        <Grid container alignItems="center"
                              justifyContent="center" direction={"column"}>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<ExpandMoreIcon/>}
                                    onClick={() => this.handlePageChange(this.state.page + 1)}
                                >
                                    More
                                </Button>
                            </Grid>
                        </Grid> : ""}
                </Container>
                <Footer/>
            </React.Fragment>
        );
    }
}

export default App;
