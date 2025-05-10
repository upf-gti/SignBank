import type { QTableColumn } from 'quasar'
import translate from './translate'
const wordStructure: QTableColumn[] = [
    {field: 'videoUrl', label: '', name: 'videoUrl', align: 'left', headerStyle: 'width: 50px'},
    {field: 'word', label: translate('word'), name: 'word', align: 'left', headerStyle: 'width: 150px'},
    {field: 'description', label: translate('description'), name: 'description', align: 'left', headerStyle: 'width: auto;'},
]

export default wordStructure
