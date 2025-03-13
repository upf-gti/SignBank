import translate from './translate'
const wordStructure = [
    {field: 'videoUrl', label: 'video', type: 'text', editable: true, align: 'left'},
    {field: 'word', label: translate('word'), type: 'text', editable: true, align: 'left'},
    {field: 'description', label: translate('description'), type: 'text', editable: true, align: 'left'},
]

export default wordStructure
