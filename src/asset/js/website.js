layui.config({
    base: '../asset/' //这是存放拓展模块的根目录
}).extend({ // 设定模块名
    mymod: 'js/mymod'
});
layui.use(['layer', 'element', 'carousel','form','mymod'], function () {
    var $=layui.$//由于layer弹层依赖jquery,所以可以直接得到
        ,layer = layui.layer
        , form = layui.form
        , element = layui.element
        , mymod = layui.mymod
        ,form=layui.form
        ,carousel = layui.carousel;
//      layer.msg('Hello World');
    carousel.render({
        elem: '#slide'
        ,width: '100%' //设置容器宽度
        ,height:'640px'
        ,arrow: 'always' //始终显示箭头
        //,anim: 'updown' //切换动画方式
    });
    $('.content').hover(
        function(){
            $(this).find('.content-icon').addClass('layui-anim layui-anim-scale');
        },
        function () {
            $(this).find('.content-icon').removeClass('layui-anim layui-anim-scale');
        }
    );
    $('.nav-item').hover(
        function () {
            $(this).find('.nav-menu').stop().slideDown();
        },
        function(){
            $(this).find('.nav-menu').stop().hide();
        }
    );
});
//    layui.link('asset/css/main.css');