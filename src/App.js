import { LoginSocialFacebook} from "reactjs-social-login";
import { FacebookLoginButton} from "react-social-login-buttons";
import axios from 'axios';
import {useState, useEffect} from "react";
import StorageIcon from '@mui/icons-material/Storage';
import './App.css';
import {LoadingButton} from "@mui/lab";
const APP_ID = '387900606919443';
function App() {

    function getUserPicture(profileId) {
        return `https://graph.facebook.com/${profileId}/picture?type=large&redirect=true&width=100&height=100`;
    }

    const [pictureUrl, setPictureUrl] = useState('');
    useEffect(() => {
        setPictureUrl(pictureUrl);
    }, [pictureUrl]);

    const [profile, setProfile] = useState(null);
    useEffect(() => {
        setProfile(profile);
        if(profile) {
            setPictureUrl(getUserPicture(profile.id));
        }
    }, [profile]);

    const [hashtag, setHashtag] = useState('');
    useEffect(() => {
        setHashtag(hashtag);
    }, [hashtag]);

    const [isLoading, setIsLoading] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);

    function handleChange(event) {
        setHashtag(event.target.value);
    }

    const archiveFacebookData = async () => {
        setIsArchiving(true);
        const { id: userId, accessToken: userAccessToken } = profile;
        const oldestYear =  document.getElementById("years").value;

        try {
            axios.post(`http://localhost:3001/social-archive`,
                { id: userId, accessToken: userAccessToken, hashtag, oldestYear})
                .then(res => {
                    console.log(`ARCHIVE OK: ${JSON.stringify(res)}`);
                })
                .catch((error) => {
                    console.log(`ARCHIVE ERROR: ${JSON.stringify(error)}`);
                });
        }catch(error){
            console.log(`fetch ERROR: ${JSON.stringify(error)}`);
        }
        setIsArchiving(false);
    }

    const getFacebookData = async () => {
        setIsLoading(true);
        try {
            axios.get(`http://localhost:3001/social-archive/facebook/posts?userId=${profile.id}&hashtag=${hashtag}`
                )
                .then(res => {
                    let posts = `<h3>${res.data.length} Results for "#${hashtag}"</h3><hr width="100%" color="green" size="2px" /><div style="overflow-y:scroll; height:400px"><table><tbody>`
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
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.log(`ARCHIVE ERROR: ${JSON.stringify(error)}`);
                    document.getElementById('postsView').innerHTML=`<div>An error occurred.</div>`
                    setIsLoading(false);
                });
        }catch(error){
            console.log(`fetch ERROR: ${JSON.stringify(error)}`);
            document.getElementById('postsView').innerHTML=`<div>An error occurred.</div>`
        }
    }

    const clearFacebookData = () => {
        document.getElementById('postsView').innerHTML=`<div>No Data.</div>`
    }

  return (
      <div>
          <div id="overlay">Loading...</div>
          <div style={{margin : 10, fontStyle: 'bold', color: 'green', float: 'left'}}>
              <table><tbody><tr><td><StorageIcon/></td><td><h4>My Social Archive</h4></td></tr></tbody></table>
          </div>
          <hr width="98%" color="green" size="1px" />
          <div>
              { !profile ?
              <LoginSocialFacebook
                  appId={APP_ID}
                  version="v18.0"
                  scope='user_posts'
                  onReject={(error) => {
                      console.log('ERROR:' + error);
                  }}
                  onResolve={(response) => {
                      setProfile(response.data);
              }}>
              <FacebookLoginButton/>
          </LoginSocialFacebook>: ''}

              {profile ? <div>
                  <table style={{margin : 10}}>
                      <tbody>
                          <tr>
                              <td><img alt='' src={pictureUrl} /></td>
                              <td>
                                  <table style={{margin : 10}}>
                                      <tbody>
                                          <tr><td><h3>{profile.name}</h3></td></tr>
                                          <tr><td>User {profile.id}</td></tr>
                                      </tbody>
                                  </table>
                              </td>
                          </tr>
                      </tbody>
                  </table>
                  <label style={{margin : 10, color: 'darkgreen'}} htmlFor="hashtag-filter">Hashtag Filter: #</label>
                  <input type='text' id='hashtag-filter' onChange={handleChange} />
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
                  <button style={{marginLeft : 30, marginTop: 30, color: 'darkgreen'}} onClick={archiveFacebookData}>
                      Archive
                  </button>
                 <button style={{marginLeft : 30, marginTop: 30, color: 'darkgreen'}} onClick={getFacebookData} disabled={isLoading}>
                      View All
                  </button>
                  <button style={{marginLeft : 30, marginTop: 30, color: 'darkgreen'}} onClick={clearFacebookData}>
                      Clear
                  </button>

              </div>: (<h5 style={{marginLeft: 10, fontStyle: 'italic', color: 'gray'}}>No Profile</h5>)}
              <div style={{marginLeft: 30, marginTop: 20, fontSize: 14}} id='postsView' />
          </div>
      </div>
  );
}

export default App;
