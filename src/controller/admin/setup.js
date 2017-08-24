// +----------------------------------------------------------------------
// | CmsWing [ 网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015-2115 http://www.cmswing.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: arterli <arterli@qq.com>
// +----------------------------------------------------------------------

const Base = require('../common/admin');
module.exports = class extends Base {
    /**
     * index action
     * @return {Promise} []
     */
    constructor(ctx){
        super(ctx); // 调用父级的 constructor 方法，并把 ctx 传递进去
        // 其他额外的操作
        this.db = this.model('setup');
        this.tactive = "setup"
    }

    async indexAction(){
        //加载配置
        //await this.loadsetup();
        //auto render template file index_index.html
        let id = this.get('id')||1;
        let type = this.config('setup.CONFIG_GROUP_LIST');
        let list = await this.db.where({'status':1,'group':id}).field('id,name,title,extra,value,remark,type').order('sort').select();
        if(list){
            this.assign('list',list);
        }
        this.assign({
            "meta_title":type[id]+"设置",
            "id":id
        })
        this.meta_title='网站配置';
        return this.display();
    }

    async saveAction(){
        let post = this.post();
        //console.log(post);
        for(let v in post){
            this.db.where({name: v}).update({value: post[v]});
        }
        think.cache("setup", null);
        process.send('think-cluster-reload-workers'); // 给主进程发送重启的指令
        //await this.loadsetup();
        this.json(1)
    }

}