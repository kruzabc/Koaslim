const http  = require('http');
const url = require('url');
const path = require('path');
const Koaslim = require('../../core/index');

const koa = new Koaslim();

async function sleep(time){
    return new Promise((resolve)=>{
        setTimeout(() => {
            resolve();
        },time);
    })
}

koa.use(async (ctx, next) => {
    console.log(ctx.request.query);
    await sleep(2000);
    ctx.body = '222';
    next();
});


koa.listen(3001);
// console.log('服务已启动，http://localhost:3001/');


/* 未完成  */
/* ctx.throw */
/* app.on */
/* ctx.cookies */
