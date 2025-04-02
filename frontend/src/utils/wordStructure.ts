import type { QTableColumn } from 'quasar'
import translate from './translate'
const wordStructure: QTableColumn[] = [
    {field: 'videoUrl', label: '', type: 'text', editable: true, align: 'left', headerStyle: 'width: 50px'},
    {field: 'word', label: translate('word'), type: 'text', editable: true, align: 'left', headerStyle: 'width: 150px'},
    {field: 'description', label: translate('description'), type: 'text', editable: true, align: 'left', headerStyle: 'width: auto;'},
]

export default wordStructure
