/**
 * Created by king on 2017/8/24.
 */
const Base = require('../common/admin');
module.exports = class extends Base {
    constructor(ctx){
        super(ctx);
        this.db = this.model('ext');
        this.tactive = "ext";
    }

    /**
     * index action
     * @return {Promise} []
     */
    async indexAction(){
        //auto render template file index_index.html
        let data = await this.db.page(this.get('page')).countSelect();
        let html = this.pagination(data);
        this.assign('pagerData', html); //分页展示使用
        this.assign('list', data.data);
        this.meta_title = "插件管理";
        return this.display();
    }

}