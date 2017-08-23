
const Base = require('../common/admin');
module.exports = class extends Base {
    constructor(ctx){
        super(ctx); // 调用父级的 constructor 方法，并把 ctx 传递进去
        // 其他额外的操作
        this.tactive = "user";
    }

    async indexAction(){
        //auto render template file index_index.html
        let action = await this.model('action').where({'status':['>',-1]}).order("id DESC").page(this.get('page')).countSelect();
        let html = this.pagination(action);
        this.assign("pagerData",html);
        this.assign("list",action.data);
        this.meta_title = "用户行为";
        return this.display();
    }
    /**
     * 新增行为
     * @returns {*}
     */
    addAction(){
        this.meta_title = "新增行为";
        this.active="admin/action/index";
        this.assign("data",null);
        return this.display();
    }
    /**
     * 编辑行为
     * @returns {*}
     */
    async editAction(){
        await this.render('add');
    }
    /**
     * 更新行为
     */
    async updateAction(){
        let data = this.post();
        if(think.isEmpty(data.id)){
            data.status=1;
            data.update_time = Date.now();
            let res = await this.model("action").add(data);
            if(res){
                this.success({name:"新增成功！",url:"/admin/action/index"});
            }else {
                this.fail("添加失败！");
            }
        }else {
            data.update_time = Date.now();
            let res = await this.model("action").update(data);
            if(res){
                this.success({name:"更新成功！",url:"/admin/action/index"});
            }else {
                this.fail("更新失败！");
            }
        }
    }
}
