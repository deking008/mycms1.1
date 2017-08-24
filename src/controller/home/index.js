// +----------------------------------------------------------------------
// | CmsWing [ 网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015-2115 http://www.cmswing.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: arterli <arterli@qq.com>
// +----------------------------------------------------------------------
const Home = require('../common/home');
module.exports = class extends Home{
    /**
     * index action
     * @return {Promise} []
     */
    async indexAction(){
        // let p = this.get();
        //return this.body="dfdfdfd";
        // let ss = think.service("geetest");
        // let sss = new ss();

        //console.log(this.config("view").nunjucks.extname);
        //auto render template file index_index.html
        this.meta_title = "首页";//标题1
        this.keywords = this.config('setup.WEB_SITE_KEYWORD') ? this.config('setup.WEB_SITE_KEYWORD') : '';//seo关键词
        this.description = this.config('setup.WEB_SITE_DESCRIPTION') ? this.config('setup.WEB_SITE_DESCRIPTION') : "";//seo描述
        this.active=['/','/index','/index.html'];
        //debugger;
        //判断浏览客户端
        if(this.isMobile){

        }else{
            //debugger;
            //console.log(think.datetime(new Date(), "YYYY-MM-DD"));
            return this.display();
        }

    }

}