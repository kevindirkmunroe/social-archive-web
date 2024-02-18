import DataTable from 'react-data-table-component';
import {useState} from "react";
import Modal from "react-modal";
import "./styles.css";

export function PostTableComponent(props){

        const [isOpen, setIsOpen] = useState(false);
        function toggleModal() {
                setIsOpen(!isOpen);
        }
        Modal.setAppElement("#root");
        const [post, setPost] = useState('');

        const OnePost = () => {

                return (
                    <div style={{width: '500px', height: '700px'}}>
                            <b>{post.id}</b><p/>
                            <div style={{fontSize: '10px', fontStyle: 'italic'}}>{post.datePosted}</div><p/>
                            <div style={{backgroundColor: '#f4f4f4', margin: '3px', fontSize: '14px'}}>{post.content}</div>
                            <p/>
                            <img src={`https://s3.us-west-1.amazonaws.com/bronze-giant-social-archive/${post.id}.jpg`} style={{objectFit: 'cover', width: '500px', height: '600px'}}/>
                    </div>
                )
        }

        const handleChange = ({ selectedRows }) => {
                // You can set state or dispatch with something like Redux so we can use the retrieved data
                console.log('Selected Rows: ', selectedRows);
        };

        const handleRowClicked = (row, event) => {
                console.log(`row = ${JSON.stringify(row)}`);
                toggleModal();
                setPost(row);
        }

        return (
            <div>{props.data.length > 0? <h3 style={{marginLeft: '10px'}}>{props.data.length} Results for "#{props.hashtag}"</h3> : <h3 style={{height: '22px'}}> </h3>}
                <hr width="98%" color="green" size="2px" />
                <DataTable
                    pagination
                    columns={props.columns}
                    data={props.data}
                    selectableRows={true}
                    selectableRowsNoSelectAll={false}
                    onSelectedRowsChange={handleChange}
                    onRowClicked={(row, event) => handleRowClicked(row, event)}
                />
                <Modal
                        isOpen={isOpen}
                        onRequestClose={toggleModal}
                        contentLabel="My dialog"
                        className="mymodal"
                        overlayClassName="myoverlay"
                        closeTimeoutMS={500}
                >
                    <OnePost/><p/>
                    <button onClick={toggleModal}>Close</button>
                </Modal>
            </div>
        )
}
