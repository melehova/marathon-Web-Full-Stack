const Model = require('../model')

module.exports = class User extends Model{
    constructor(props) {
        super(props);
    }
    find(id) {
        return super.find(id)
    }
    delete() {
        return super.delete()
    }
    save() {
        return super.save()
    }
}
