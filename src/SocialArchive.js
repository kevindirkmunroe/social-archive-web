import 'dotenv/config.js';
import {Component} from "react";
import StorageIcon from "@mui/icons-material/Storage";
import {LoginSocialFacebook} from "reactjs-social-login";
import {FacebookLoginButton} from "react-social-login-buttons";
import axios from "axios";
import {ThreeDots} from "react-loader-spinner";
import { LoadingButton } from '@mui/lab';

const HOST = process.env.SOCIAL_ARCHIVE_HOST;
const PORT = process.env.SOCIAL_ARCHIVE_PORT;
const APP_ID = process.env.SOCIAL_ARCHIVE_APP_ID;
const FACEBOOK_APP_VERSION = process.env.FACEBOOK_APP_VERSION;

class SocialArchive extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pictureUrl: '',
            profile: null,
            hashtag: '',
            isLoading: false
        }
    }

    handleChange(event) {
        this.setState({hashtag: event.target.value});
    }

    async archiveFacebookData(){

        const { id: userId, accessToken: userAccessToken } = this.state.profile;
        const oldestYear =  document.getElementById("years").value;

        try {
            axios.post(`http://${HOST}:${PORT}/social-archive`,
                { id: userId, accessToken: userAccessToken, hashtag: this.state.hashtag, oldestYear})
                .then(res => {
                    console.log(`ARCHIVE OK: ${JSON.stringify(res)}`);
                })
                .catch((error) => {
                    console.log(`ARCHIVE ERROR: ${JSON.stringify(error)}`);
                });
        }catch(error){
            console.log(`fetch ERROR: ${JSON.stringify(error)}`);
        }
    }

    async getFacebookData(){
        this.setState({isLoading: true});
        try {
            axios.get(`http://${HOST}:${PORT}/social-archive/facebook/posts?userId=${this.state.profile.id}&hashtag=${this.state.hashtag}`
            )
                .then(res => {
                    let posts = '<h2 style="color: darkgreen">Posts</h2><hr width="100%" color="green" size="2px" /><div style="overflow-y:scroll; height:400px"><table><tbody>'
                    res.data.forEach((doc) => {
                        let url = './logo.svg';
                        const allMedia = doc.attachments;
                        if(allMedia){
                            const { data } = allMedia;
                            const firstMedia = data[0];
                            const { media } = firstMedia;
                            const { image } = media;
                            url = image.src;
                        }
                        posts = posts.concat(`<tr style="border:solid border-color: black border-width: 5px 0 vertical-align: top"><td style="vertical-align: top">${new Date(doc.created_time).toLocaleDateString()}</td><td><img src="${url}" width="100" height="100" /></td><td style="vertical-align: top">${doc.message}</td></tr>`)
                    });

                    posts.concat('</tbody></table></div>');
                    document.getElementById('postsView').innerHTML=`<div>${posts}</div>`
                    this.setState({isLoading: false});
                })
                .catch((error) => {
                    console.log(`ARCHIVE ERROR: ${JSON.stringify(error)}`);
                    this.setState({isLoading: false});
                });
        }catch(error){
            console.log(`fetch ERROR: ${JSON.stringify(error)}`);
            this.setState({isLoading: false});
        }
    }

    clearFacebookData(){
        document.getElementById('postsView').innerHTML=`<div>No Data.</div>`
    }

    render() {

        const Button = `<button style={{
            backgroundColor: "darkgreen",
            color: "white",
            fontSize: "20px",
            padding: "10px 60px",
            borderRadius: "5px",
            margin: "10px 0px",
            cursor: "pointer"
        }} />`;

        return(
            <div>
                <div id="overlay">Loading...</div>
                <div style={{margin : 10, fontStyle: 'bold', color: 'green', float: 'left'}}>
                    <table><tbody><tr><td><StorageIcon/></td><td><h4>My Social Archive</h4></td></tr></tbody></table>
                </div>
                <hr width="98%" color="green" size="1px" />
                <div>
                    { !this.state.profile ?
                        <LoginSocialFacebook
                            appId={APP_ID}
                            version={FACEBOOK_APP_VERSION}
                            scope='user_posts'
                            onReject={(error) => {
                                console.log('ERROR:' + error);
                            }}
                            onResolve={(response) => {
                                this.setState({profile: response.data});
                            }}>
                            <FacebookLoginButton/>
                        </LoginSocialFacebook>: ''}

                    {this.state.profile ? <div>
                        <table style={{margin : 10}}>
                            <tbody>
                            <tr>
                                <td><img alt='' src={this.state.pictureUrl} /></td>
                                <td>
                                    <table style={{margin : 10}}>
                                        <tbody>
                                        <tr><td><h3>{this.state.profile.name}</h3></td></tr>
                                        <tr><td>User {this.state.profile.id}</td></tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        <label style={{margin : 10, color: 'darkgreen'}} htmlFor="hashtag-filter">Hashtag Filter: #</label>
                        <input type='text' id='hashtag-filter' onChange={this.handleChange} />
                        <label style={{margin : 10, color: 'darkgreen'}} htmlFor="years">Oldest:</label>
                        <select name="years" id="years" style={{width: 55}}>
                            <option value="2013">2013</option>
                            <option value="2014">2014</option>
                            <option value="2015">2015</option>
                            <option value="2016">2016</option>
                            <option value="2017">2017</option>
                            <option value="2018">2018</option>
                            <option value="2019">2019</option>
                            <option value="2020">2020</option>
                            <option value="2021">2021</option>
                            <option value="2022">2022</option>
                            <option selected="selected" value="2023">2023</option>
                            <option value="2024">2024</option>
                        </select>
                        <button style={{marginLeft : 30, marginTop: 30, color: 'darkgreen'}} onClick={this.archiveFacebookData}>
                            Archive
                        </button>
                        <LoadingButton
                            size="small"
                            onClick={this.getFacebookData}
                            loading={this.state.isLoading}
                            loadingIndicator="Loading…"
                            variant="outlined"
                        >
                            View All
                        </LoadingButton>
                        <button style={{marginLeft : 30, marginTop: 30, color: 'darkgreen'}} onClick={this.clearFacebookData}>
                            Clear
                        </button>
                        <button style={{marginLeft : 30, marginTop: 30, color: 'darkgreen'}}>
                            Go To Gallery
                        </button>

                    </div>: (<h5 style={{marginLeft: 10, fontStyle: 'italic', color: 'gray'}}>No Profile</h5>)}
                    { this.state.isLoading? <ThreeDots/> : <div style={{marginLeft: 30, marginTop: 20, fontSize: 14}} id='postsView' />}
                </div>
            </div>
        );
    }
}

export default SocialArchive;
