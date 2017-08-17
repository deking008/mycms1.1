/**
 * Created by king on 2017/8/17.
 */
const Base = require('../common/admin');
module.exports = class extends Base {
    /**
     * index action
     * @return {Promise} []
     */
    constructor(ctx){
        super(ctx); // 调用父级的 constructor 方法，并把 ctx 传递进去
        // 其他额外的操作
        this.db=this.model("member");
        this.tactive = "user";
    }
    async indexAction() {
        let map = {'status': ['>', -1]}
        if(!think.isEmpty(this.get("username"))){
            map.username= ["like", "%"+this.get("username")+"%"]
        }
        let data = await this.db.where(map).page(this.get('page')||1,20).order('id DESC').countSelect();
        let html = this.pagination(data);
        this.assign('pagerData', html); //分页展示使用
        this.assign('list', data.data);
        this.meta_title="用户列表";
        //获取管理组
        let role = this.model("auth_role").where({status:1}).select();
        this.assign("role",role);
        return this.display();
    }

    async adduserAction() {
        return this.display();
    }
}