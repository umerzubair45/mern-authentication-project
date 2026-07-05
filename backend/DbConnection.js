const mongoose =require('mongoose')
const DbConnection = ()=>{

    mongoose.connect('mongodb://localhost:27017/loginSystem')
    .then(()=>{
    console.log('DB connected')
    })
    .catch(()=>{
    console.log('DB not connected')
})
}
module.exports = DbConnection;