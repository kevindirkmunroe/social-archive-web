import { LoginSocialFacebook} from "reactjs-social-login";
import { FacebookLoginButton} from "react-social-login-buttons";
import axios from 'axios';
import {useState, useEffect} from "react";
import StorageIcon from '@mui/icons-material/Storage';

import './App.css';
import {PostTableComponent} from "./PostTableComponent";



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

    const [postsData, setPostsData] = useState([]);
    useEffect(() => {
        setPostsData(postsData);
    }, [postsData])

    const [isLoading, setIsLoading] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const dateSort = (rowA, rowB) => {
        const a = new Date(rowA.datePosted);
        const b = new Date(rowB.datePosted);
        if( a > b) {
            return 1;
        }

        if(b > a ){
            return -1;
        }

        return 0;
    }

    const COLUMNS = [{name: 'Link', selector: row => row.originalPost, maxWidth: '50px', cell: (data) => <a href={'https://www.facebook.com/' + data.id} target="_blank"><img alt="Facebook" src="./facebook-16x16-icon.png" width="20" height="20" /></a>},
        {name: 'Post Date', selector: row => row.datePosted, sortable: true, sortFunction: dateSort, maxWidth: '150px'},
        {name: 'Top Image', selector: row => row.image, maxWidth: '200px', cell: (data) => <img alt="" src={'https://s3.us-west-1.amazonaws.com/bronze-giant-social-archive/' + data.id + '.jpg'} width="100" height="100" style={{marginTop: '3px', borderRadius: '10px'}}/> },
        {name: 'Content', selector: row => row.content, maxWidth: '600px'}];

    function handleChange(event) {
        setHashtag(event.target.value);
    }

    const handleDialogClose = () => {
        setSelectedItem(null);
    };

    const cropText = (text) => {
        if( text.length > 400){
            return `${text.slice(0, 400)}<b>...</b>`;
        }
        return text;
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
        const newPostsData = [];
        try {
            axios.get(`http://localhost:3001/social-archive/facebook/posts?userId=${profile.id}&hashtag=${hashtag}`
                )
                .then(res => {
                    res.data.forEach((doc) => {

                        const url = `https://s3.us-west-1.amazonaws.com/bronze-giant-social-archive/${doc._id}.jpg`;
                        newPostsData.push({id: doc._id, originalPost: `<a href="https://www.facebook.com/${doc._id}" target="_blank"><img alt="Facebook" src="facebook-16x16-icon.png" width="20" height="20" /></a>`, datePosted: new Date(doc.created_time).toLocaleDateString(), image: url, content: cropText(doc.message)  });
                    });

                    setIsLoading(false);
                    setPostsData(newPostsData);
                })
                .catch((error) => {
                    console.log(`ARCHIVE ERROR: ${JSON.stringify(error)}`);
                    setIsLoading(false);
                });
        }catch(error){
            console.log(`fetch ERROR: ${JSON.stringify(error)}`);
        }
    }

    const clearFacebookData = () => {
        setPostsData([]);
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
                  <select name="years" id="years" style={{width: 55}} defaultValue={2024}>
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
                      <option value="2023">2023</option>
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
              <PostTableComponent
                  columns={COLUMNS}
                  hashtag={hashtag}
                  data={postsData}
                  selectableRows
              />
          </div>
      </div>
  );
}

export default App;
