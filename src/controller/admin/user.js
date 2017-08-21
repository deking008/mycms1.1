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

    /**
     * 注册异步验证用户数据
     * @returns {Promise|*}
     */
    async parsleyAction(){
        //验证
        let data=this.get();
        // console.log(data);
        let res = await this.db.where(data).find();
        // console.log(res);
        if(think.isEmpty(res)){
            return this.json(1);
        }else{
            return this.json(0);
        }
    }

    /**
     * adduser
     * 添加用户
     * @returns {Promise|*}
     */
    async adduserAction(){
        if(this.isPost){
            let data=this.post();
            if(data.password!=data.repassword){
                return this.fail("两次填入的密码不一致");
            }
            data.password = encryptPassword(data.password);
            data.reg_time = new Date().getTime();
            if(data.vip==1){
                data.overduedate=new Date(data.overduedate).getTime();
            }else {
                data.overduedate = think.isEmpty(data.overduedate)?0:data.overduedate;
            }
            console.log(data);
            // return this.fail("ddd")
            data.status=1;
            let self = this;
            let res;
            if(data.is_admin == 1) {
                res = await this.db.transaction(async () => {
                    let userId = await self.db.add(data);
                return await self.model('auth_user_role').db(self.db.db()).add({
                    user_id: userId,
                    role_id: data.role_id
                });
            });
            }else{
                res = await this.db.add(data);
            }

            if(res){
                return this.success({name:"添加成功！"});
            }else{
                return this.fail("添加失败!")
            }
        }else {
            //会员组
            let usergroup = await this.model("member_group").select();
            this.assign("usergroup",usergroup);
            //获取管理组
            let role = await this.model("auth_role").where({status:1}).select();
            this.assign("role",role);
            this.meta_title="添加用户";
            return this.display();
        }

    }

    async userdelAction(){
        let id = this.para("ids");
        console.log(id);
        let res;
        // 判断是否是管理员
        if(await this.isadmin(id)){
            return this.fail("不能删除管理员！");
        } else {
            //res = await this.db.where({id: id}).delete();
            //逻辑删除
            res = await this.db.where({id:["IN",id]}).update({status: -1});
            if(res){
                return this.success({name: "删除成功！"});
            } else {
                return this.fail("删除失败！");
            }
        }
    }
}