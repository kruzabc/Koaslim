let http = require('http');
let context = require('./context');
let request = require('./request');
let response = require('./response');
let EventEmitter = require('events');

class Koaslim extends EventEmitter {
    constructor(props) {
        super();
        this.middlewares = [];
    }

    set keys(data){
        // todo like koa keys
    }

    use(middleware){
        if(typeof middleware !== 'function')
            throw Error('middleware must be Function type');
        this.middlewares.push(middleware);
        return this;
    }

    compose() {
        // 将middlewares合并为一个函数，该函数接收一个ctx对象
        return async (ctx) => {
            function createNext(middleware, oldNext) {
                return async () => {
                    await middleware(ctx, oldNext);
                }
            }

            let len = this.middlewares.length;
            let next = async () => {
                return Promise.resolve();
            };
            for (let i = len - 1; i >= 0; i--) {
                let currentMiddleware = this.middlewares[i];
                next = createNext(currentMiddleware, next);
            }

            await next();
        };
    }

    listen(...args){
        let server = http.createServer((req, res) => {
            let ctx = this.createContext(req, res);
            this.compose()(ctx).then(() => {
                this.responseBody(ctx)
            }).catch((err) => {
                this.onerror(err, ctx)
            });
        });
        return server.listen(...args);
    }

    createContext(req, res){
        let ctx = Object.create(context);
        ctx.app = req.app = res.app = this;
        ctx.request = Object.create(request);
        ctx.response = Object.create(response);
        ctx.request.ctx = ctx.response.ctx = ctx;
        ctx.req = ctx.request.req = req;
        ctx.res = ctx.response.res = res;

        ctx.originalUrl = req.originalUrl = req.url;
        ctx.state = {};
        return ctx;
    }

    responseBody(ctx){
        let content = ctx.body;
        // console.log(content);
        if (typeof content === 'string') {
            ctx.res.end(content);
        } else if (typeof content === 'object') {
            ctx.res.end(JSON.stringify(content));
        }else{
            ctx.res.end('');
        }
    }

    onerror(err, ctx) {
        if (err.code === 'ENOENT') {
            ctx.status = 404;
        } else {
            ctx.status = 500;
        }
        let msg = err.message || 'Internal error';
        ctx.res.end(msg);
        this.emit('error', err);
    }

    on(errType, fn){

    }
}

module.exports = Koaslim;
