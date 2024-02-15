import DataTable from 'react-data-table-component';

export function PostTableComponent(props){
        return (
            <DataTable
                pagination
                columns={props.columns}
                data={props.data}
                selectableRows={true}
                selectableRowsNoSelectAll={false}
            />
        )
}
