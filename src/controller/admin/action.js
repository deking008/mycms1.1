
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
    /**
     * 日志列表
     * @returns {*}
     */
    async logAction(){
        //获取列表数据
        let map={}
        map.status = ['>',-1];
        let list = await this.model("action_log").where({'status':['>',-1]}).order("id DESC").page(this.get('page')).countSelect();
        //console.log(list);
        let html = this.pagination(list);
        this.assign("pagerData",html);
        for(let itme of list.data){
            itme.action_id=await this.model("action").get_action(itme.action_id,"title");
            itme.user_id = await this.model("member").get_nickname(itme.user_id);
        }
        this.assign("list",list.data);
        this.meta_title = "行为日志";
        return this.display();
    }
    /**
     * 删除日志
     */
    async removeAction(){
        let ids = this.param("ids");
        think.isEmpty(ids)&& this.fail("参数错误");
        let map={};
        if(think.isArray(ids)){
            map.id = ['IN',ids];
        }else if(think.isNumberString(ids)){
            map.id = ids;
        }
        let res = await this.model('action_log').where(map).delete();
        if(res){
            this.success({name:"删除成功！",url:"/admin/action/log"});
        }else {
            this.fail("删除失败！");
        }
    }
    // 清楚日志
    async clearAction(){
        let res = await this.model('action_log').where('1=1').delete();
        if(res){
            this.success({name:'日志清空成功！',url:"/admin/action/log"});
        }else {
            this.fail("日志清空失败！");
        }
    }
}
