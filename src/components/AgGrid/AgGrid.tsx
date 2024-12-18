import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { useCallback, useMemo, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, GridOptions } from 'ag-grid-community'
import { Button } from '@app/components/Button/Button'

interface AgGridProps {
  rowData: any[]
  colDefs: ColDef[]
}

const AgGrid = ({ rowData, colDefs }: AgGridProps) => {
  const gridRef = useRef<AgGridReact>(null)
  const gridOptions: GridOptions = useMemo(() => {
    return {
      defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
        editable: true,
        floatingFilter: true,
      },
      animateRows: true,
      pagination: true,
      alwaysShowHorizontalScroll: true,
      alwaysShowVerticalScroll: true,
      paginationPageSize: 50,
      enableGroupEdit: true,
    }
  }, [])

  const rowSelection: any = useMemo(() => {
    return {
      mode: 'multiRow',
    }
  }, [])

  const onBtnExport = useCallback(() => {
    gridRef.current!.api.exportDataAsCsv()
  }, [])

  return (
    <div id="gridware-grid" className={'ag-theme-alpine'}>
      <Button className="mb-1" onClick={onBtnExport}>
        Download CSV export file
      </Button>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={colDefs}
        gridOptions={gridOptions}
        rowSelection={rowSelection}
        domLayout={'autoHeight'}
      />
    </div>
  )
}

export default AgGrid
