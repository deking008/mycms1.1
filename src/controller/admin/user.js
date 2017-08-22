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

    async edituserAction(){
        if(this.isPost){
            let data = this.post();
            //删除头像
            if(data.delavatar ==1){
                let uploadPath = think.resource + '/upload/avatar/' + data.id;
                let path = think.isFile(uploadPath  + "/avatar.png");
                if(path){
                    think.rmdir(uploadPath, false)
                }
            }

            if(think.isEmpty(data.password)&&think.isEmpty(data.repassword)){
                delete data.password;
            }else {
                if(data.password !=data.repassword){
                    return this.fail("两次填入的密码不一致");
                }
                data.password = encryptPassword(data.password);
            }
            if(data.vip==1){
                data.overduedate=new Date(data.overduedate).getTime();
            }else {
                data.overduedate = 0;
            }
            //添加角色
            if(data.is_admin == 1){
                let addrole =await this.model("auth_user_role").where({user_id:data.id}).thenAdd({user_id:data.id,role_id:data.role_id});
                //console.log(addrole);
                if(addrole.type=="exist"){
                    await this.model("auth_user_role").update({id:addrole.id,role_id:data.role_id});
                }
            }
            let res = await this.db.update(data);

            if(res){
                return this.success({name:"编辑成功！"});
            }else{
                return this.fail("编辑失败!")
            }
        }else {
            let id = this.get("id");
            let user = await this.model("member").find(id);
            //不能修改超级管理员的信息
            if(!this.is_admin){
                if(in_array(id,this.config("user_administrator"))){
                    const error = this.controller('common/error');
                    return error.noAction('您无权操作！')
                }

            }
            this.assign("user",user);
            //console.log(user);
            //所属管理组
            if(user.is_admin==1){
                let roleid =await this.model("auth_user_role").where({user_id:user.id}).getField("role_id",true);
                this.assign("roleid",roleid)
            }
            //会员组
            let usergroup = await this.model("member_group").select();
            this.assign("usergroup",usergroup);
            //获取管理组
            let role = await this.model("auth_role").where({status:1}).select();
            this.assign("role",role);
            this.meta_title="编辑用户";
            return this.display();
        }
    }

    async showuserAction(){
        let id = this.get("id");
        let user = await this.model("member").find(id);
        this.assign("user",user);
        //所属管理组
        if(user.is_admin==1){
            let roleid =await this.model("auth_user_role").where({user_id:user.id}).getField("role_id",true);
            this.assign("roleid",roleid)
        }
        //会员组
        let usergroup = await this.model("member_group").select();
        this.assign("usergroup",usergroup);
        //获取管理组
        let role = await this.model("auth_role").where({status:1}).select();
        this.assign("role",role);
        this.meta_title = "个人信息";
        return this.display();
    }
    /**
     * 会员充值
     */
    async rechargeAction(){
        if(this.isAjax("POST")){
            let data = this.post();
            let self =this;
            let insertId = await this.db.transaction(async () => {
                await  self.db.where({id:data.id}).increment("amount",data.balance);
            let amount_log = await self.db.where({id:data.id}).getField("amount",true);
            return await self.model('balance_log').db(self.db.db()).add({
                admin_id:self.user.uid,
                user_id:data.id,
                type:2,
                time:new Date().valueOf(),
                amount:data.balance,
                amount_log:amount_log,
                note:`管理员（${await get_nickname(self.user.uid)}）为您充值，充值的金额为：${data.balance} 元`
            });
        });

            if(insertId){
                return this.success({name:"充值成功!"});
            }else {
                return this.fail("充值失败!")
            }

        }else {
            let id = this.get("ids");
            let name =await get_nickname(id);
            this.assign("name",name);
            this.assign("id",id);
            this.meta_title = "会员充值";
            return this.display();
        }

    }
}