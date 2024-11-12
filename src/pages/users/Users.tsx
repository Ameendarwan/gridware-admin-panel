import { useState } from 'react'
import { ColDef } from 'ag-grid-community'
import AgGrid from '@app/components/AgGrid/AgGrid'

const Users = () => {
  const [colDefs] = useState<ColDef[]>([
    { field: 'id', headerName: 'ID', type: 'number' },
    { field: 'created_at', headerName: 'Created At', type: 'date' },
    { field: 'updated_at', headerName: 'Updated At', type: 'date' },
    { field: 'email', headerName: 'Email', type: 'string' },
    { field: 'is_invited_to_auth0', headerName: 'Invited to Auth0', type: 'boolean' },
    { field: 'created_by', headerName: 'Created by', type: 'string' },
    { field: 'updated_by', headerName: 'Updated by', type: 'string' },
  ])
  const [rowData] = useState([
    {
      id: 1,
      created_at: '2021-01-01',
      updated_at: '2021-01-01',
      email: 'ZKX4c@example.com',
      is_invited_to_auth0: true,
      created_by: 'John Doe',
      updated_by: 'John Doe',
    },
    {
      id: 2,
      created_at: '2022-05-15',
      updated_at: '2022-05-16',
      email: 'ALW9g@example.com',
      is_invited_to_auth0: false,
      created_by: 'Jane Smith',
      updated_by: 'Jane Smith',
    },
    {
      id: 3,
      created_at: '2023-03-25',
      updated_at: '2023-03-26',
      email: 'XRT2d@example.com',
      is_invited_to_auth0: true,
      created_by: 'Alice Brown',
      updated_by: 'Alice Brown',
    },
    {
      id: 4,
      created_at: '2020-11-05',
      updated_at: '2020-11-07',
      email: 'QWER8k@example.com',
      is_invited_to_auth0: false,
      created_by: 'Bob Johnson',
      updated_by: 'Bob Johnson',
    },
    {
      id: 5,
      created_at: '2023-08-12',
      updated_at: '2023-08-13',
      email: 'DFT3m@example.com',
      is_invited_to_auth0: true,
      created_by: 'Charlie Green',
      updated_by: 'Charlie Green',
    },
    {
      id: 6,
      created_at: '2022-02-17',
      updated_at: '2022-02-18',
      email: 'VBN9p@example.com',
      is_invited_to_auth0: true,
      created_by: 'Eve White',
      updated_by: 'Eve White',
    },
    {
      id: 7,
      created_at: '2021-07-20',
      updated_at: '2021-07-21',
      email: 'ZP9wq@example.com',
      is_invited_to_auth0: false,
      created_by: 'David Black',
      updated_by: 'David Black',
    },
    {
      id: 8,
      created_at: '2024-04-10',
      updated_at: '2024-04-12',
      email: 'OIW8v@example.com',
      is_invited_to_auth0: true,
      created_by: 'Grace Yellow',
      updated_by: 'Grace Yellow',
    },
    {
      id: 9,
      created_at: '2021-09-28',
      updated_at: '2021-09-30',
      email: 'ASD4l@example.com',
      is_invited_to_auth0: true,
      created_by: 'Henry Red',
      updated_by: 'Henry Red',
    },
    {
      id: 10,
      created_at: '2020-06-02',
      updated_at: '2020-06-04',
      email: 'BNX1j@example.com',
      is_invited_to_auth0: false,
      created_by: 'Ivy Blue',
      updated_by: 'Ivy Blue',
    },
  ])

  return (
    <>
      <div className="hidden flex-col md:flex">
        <AgGrid rowData={rowData} colDefs={colDefs} />
      </div>
    </>
  )
}
export default Users
