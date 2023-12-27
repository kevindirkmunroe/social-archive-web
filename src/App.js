import { LoginSocialFacebook} from "reactjs-social-login";
import { FacebookLoginButton} from "react-social-login-buttons";
import axios from 'axios';
import './App.css';
import {useState, useEffect} from "react";
import StorageIcon from '@mui/icons-material/Storage';

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


    function handleChange(event) {
        setHashtag(event.target.value);
    }
    const archiveFacebookData = async () => {

        const { id: userId, accessToken: userAccessToken } = profile;
        try {
            axios.post(`http://localhost:3001/social-archive`,
                { id: userId, accessToken: userAccessToken, hashtag: hashtag})
                .then(res => {
                    console.log(`ARCHIVE OK`);
                })
                .catch((error) => {
                    console.log(`ARCHIVE ERROR: ${JSON.stringify(error)}`);
                });
        }catch(error){
            console.log(`fetch ERROR: ${JSON.stringify(error)}`);
        }
    }

    const getFacebookData = async () => {
        try {
            axios.get(`http://localhost:3001/social-archive/facebook/posts?userId=${profile.id}&hashtag=${hashtag}`
                )
                .then(res => {
                    let posts = '<h2 style="color: darkgreen">Posts</h2><hr width="100%" color="green" size="2px" /><table>'
                    res.data.forEach((doc) => {
                        posts = posts.concat(`<tr style="border:solid border-color: black border-width: 5px 0"><td>${new Date(doc.created_time).toLocaleString()}</td><td>${doc.message}</td></tr>`)
                    });

                    posts.concat('</table>');
                    document.getElementById('postsView').innerHTML=`<div>${posts}</div>`
                })
                .catch((error) => {
                    console.log(`ARCHIVE ERROR: ${JSON.stringify(error)}`);
                });
        }catch(error){
            console.log(`fetch ERROR: ${JSON.stringify(error)}`);
        }
    }

    const clearFacebookData = () => {
        document.getElementById('postsView').innerHTML=`<div>No Data.</div>`
    }

  return (
      <div>
          <div style={{margin : 10, fontStyle: 'bold', color: 'green', float: 'left'}}>
              <table><tr><td><StorageIcon/></td><td><h4>Social Archive</h4></td></tr></table>
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
                      <tr>
                          <td><img alt='' src={pictureUrl} /></td>
                          <td>
                              <table style={{margin : 10}}>
                                  <tr><td><h3>{profile.name}</h3></td></tr>
                                  <tr><td>User {profile.id}</td></tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  <label style={{margin : 10, color: 'darkgreen'}} htmlFor="hashtag-filter">Hashtag Filter: #</label>
                  <input type='text' id='hashtag-filter' onChange={handleChange} />

                  <button style={{marginLeft : 30, marginTop: 30, color: 'darkgreen'}} onClick={archiveFacebookData}>
                      Archive
                  </button>
                  <button style={{marginLeft : 30, marginTop: 30, color: 'darkgreen'}} onClick={getFacebookData}>
                      View
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
