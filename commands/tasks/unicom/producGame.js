// 娱乐中心
const CryptoJS = require("crypto-js");
const path = require('path')

var transParams = (data) => {
    let params = new URLSearchParams();
    for (let item in data) {
        params.append(item, data['' + item + '']);
    }
    return params;
};
// https://img.client.10010.com/gametask/index.html#/
// 积分活动相关业务参数
let account = {
    "androidCodeId": "945188116",
    "iosCodeId": "945188122",
    "acId": "AC20200728150217",
    "taskId": "96945964804e42299634340cd2650451",
    "remark": "游戏视频任务积分",
    "channel": "GGPD",
    "channelName": "游戏视频任务积分",
    "unWantedToast": false,
    "unWantedToast2": true, "rewards": true,
    "codeId": "945535736",
    "action": "showVideoAd"
}


module.exports = {
    // 娱乐中心每日签到-打卡
    gameSignin: (axios, options) => {
        const useragent = `Mozilla/5.0 (Linux; Android 7.1.2; SM-G977N Build/LMY48Z; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/75.0.3770.143 Mobile Safari/537.36; unicom{version:android@8.0100,desmobile:${options.user}};devicetype{deviceBrand:samsung,deviceModel:SM-G977N};{yw_code:}    `
        let data = {
            'methodType': 'signin'
        }
        return new Promise((resolve, reject) => {
            axios.request({
                baseURL: 'https://m.client.10010.com/',
                headers: {
                    "user-agent": useragent,
                    "referer": "https://img.client.10010.com",
                    "origin": "https://img.client.10010.com"
                },
                url: `/producGame_signin`,
                method: 'post',
                data: transParams(data)
            }).then(res => {
                let result = res.data
                if (result) {
                    if (result.respCode !== '0000') {
                        console.log('娱乐中心每日签到失败', result.respDesc)
                    } else {
                        console.log('娱乐中心每日签到获得+' + result.currentIntegral)
                    }
                } else {
                    console.log('娱乐中心每日签到失败')
                }
                resolve()
            }).catch(reject)
        })
    },

    playGame: async (axios, options) => {
        const { game, app, launchid } = options

        let jwt = undefined
        axios.defaults.headers.cookie.split('; ').forEach(item => {
            if (item.indexOf('jwt') === 0) {
                jwt = item.split("=").pop()
            }
        })

        if (!jwt) {
            console.log('jwt缺失')
            return
        }

        let person = require(path.resolve(path.join(__dirname, './playGame.json')));
        let protobufRoot = require('protobufjs').Root;
        let root = protobufRoot.fromJSON(person);
        let mc = root.lookupType('c');
        var moment = require('moment');
        var fs = require('fs');
        let launchId1 = launchid || new Date().getTime() + ''

        let n = 1;

        do {
            console.log('第', n, '次')
            let dd = moment().format('MMDDHHmmss')
            let time = new Date().getTime() % 1000
            let s = Math.floor(Math.random() * 90000) + 10000
            let traceid = `${options.user}_${dd}${time}_${s}`
            let Seq = n * 3

            let a = {
                'uin': `${options.user}`,
                'sig': jwt,
                'platform': '2001',
                'type': 0,
                'appid': '101794394'
            }
            let busiBuff = {
                extInfo: null,
                appid: game.gameCode,
                factType: n == 6 ? 13 : 12,
                duration: null,
                reportTime: Math.floor(new Date().getTime() / 1000),
                afterCertify: 0,
                appType: 1,
                scene: 1001,
                totalTime: n * 62,
                launchId: launchId1,
                via: '',
                AdsTotalTime: 0,
                hostExtInfo: null
            }
            let c = {
                'Seq': Seq,
                'qua': 'V1_AND_MINISDK_1.5.3_0_RELEASE_B',
                'deviceInfo': 'm=VKY-AL00&o=9&a=28&p=1080*1920&f=HUAWEI&mm=5725&cf=1800&cc=8&qqversion=null',
                'busiBuff': busiBuff,
                'traceid': traceid,
                'Module': `mini_app_growguard`,
                'Cmdname': 'JudgeTiming',
                'loginSig': a,
                'Crypto': null,
                'Extinfo': null,
                'contentType': 0
            }

            let infoEncodeMessage = mc.encode(mc.create(c)).finish();

            let Nonce = Math.floor(Math.random() * 90000) + 10000
            let Timestamp = Math.floor(new Date().getTime() / 1000)

            let str = `POST /mini/OpenChannel?Action=input&Nonce=${Nonce}&PlatformID=2001&SignatureMethod=HmacSHA256&Timestamp=${Timestamp}`
            let Signature = CryptoJS.HmacSHA256(str, 'test')
            let hashInBase64 = CryptoJS.enc.Base64.stringify(Signature);

            let res = await axios.request({
                headers: {
                    "user-agent": "okhttp/4.4.0"
                },
                url: `https://q.qq.com/mini/OpenChannel?Action=input&Nonce=${Nonce}&PlatformID=2001&SignatureMethod=HmacSHA256&Timestamp=${Timestamp}&Signature=${hashInBase64}`,
                method: 'post',
                responseType: 'arrayBuffer',
                data: infoEncodeMessage
            }).catch(err => console.log(err))

            console.log(Buffer.from(res.data).toString('hex'))

            await new Promise((resolve, reject) => setTimeout(resolve, 65 * 1000))

            ++n
        } while (n <= 6)
    },
    popularGames: async (axios, options) => {
        const useragent = `Mozilla/5.0 (Linux; Android 7.1.2; SM-G977N Build/LMY48Z; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/75.0.3770.143 Mobile Safari/537.36; unicom{version:android@8.0100,desmobile:${options.user}};devicetype{deviceBrand:samsung,deviceModel:SM-G977N};{yw_code:}    `
        let params = {
            'methodType': 'popularGames',
            'deviceType': 'Android',
            'clientVersion': '8.0100',
        }
        let { data } = await axios.request({
            baseURL: 'https://m.client.10010.com/',
            headers: {
                "user-agent": useragent,
                "referer": "https://img.client.10010.com",
                "origin": "https://img.client.10010.com"
            },
            url: `/producGameApp`,
            method: 'post',
            data: transParams(params)
        })
        if (data) {
            return data.popularList || []
        } else {
            console.log('记录失败')
        }
    },
    gameverify: async (axios, options) => {
        const useragent = `Mozilla/5.0 (Linux; Android 7.1.2; SM-G977N Build/LMY48Z; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/75.0.3770.143 Mobile Safari/537.36; unicom{version:android@8.0100,desmobile:${options.user}};devicetype{deviceBrand:samsung,deviceModel:SM-G977N};{yw_code:}    `
        let jwt = undefined
        axios.defaults.headers.cookie.split('; ').forEach(item => {
            if (item.indexOf('jwt') === 0) {
                jwt = item.split("=").pop()
            }
        })
        let { data } = await axios.request({
            baseURL: 'https://m.client.10010.com/',
            headers: {
                "user-agent": "okhttp/4.4.0",
                "referer": "https://img.client.10010.com",
                "origin": "https://img.client.10010.com"
            },
            url: `/game/verify`,
            method: 'post',
            data: {
                "extInfo": jwt,
                "auth": {
                    "uin": options.user,
                    "sig": jwt
                }
            }
        })
        if (data) {
            if (data.respCode !== 0) {
                console.log(data.errorMessage)
            }
        } else {
            console.log('记录失败')
        }
    },
    timeTaskQuery: async (axios, options) => {
        const useragent = `Mozilla/5.0 (Linux; Android 7.1.2; SM-G977N Build/LMY48Z; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/75.0.3770.143 Mobile Safari/537.36; unicom{version:android@8.0100,desmobile:${options.user}};devicetype{deviceBrand:samsung,deviceModel:SM-G977N};{yw_code:}    `
        let params = {
            'methodType': 'timeTaskQuery',
            'deviceType': 'Android',
            'clientVersion': '8.0100'
        }
        let { data } = await axios.request({
            baseURL: 'https://m.client.10010.com/',
            headers: {
                "user-agent": useragent,
                "referer": "https://img.client.10010.com",
                "origin": "https://img.client.10010.com"
            },
            url: `/producGameApp`,
            method: 'post',
            data: transParams(params)
        })
        if (data) {
            console.log(data.msg)
            return data.data.filter(g => g.state === '0')//0未进行 state=1待领取 state=2已完成
        } else {
            console.log('记录失败')
        }
    },
    gameFlowGet: async (axios, options) => {
        // TODO 未知游戏时长上报
        const { gameId } = options
        const useragent = `Mozilla/5.0 (Linux; Android 7.1.2; SM-G977N Build/LMY48Z; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/75.0.3770.143 Mobile Safari/537.36; unicom{version:android@8.0100,desmobile:${options.user}};devicetype{deviceBrand:samsung,deviceModel:SM-G977N};{yw_code:}    `
        let params = {
            'userNumber': options.user,
            'methodType': 'flowGet',
            'gameId': gameId,
            'deviceType': 'Android',
            'clientVersion': '8.0100',
        }
        let { data } = await axios.request({
            baseURL: 'https://m.client.10010.com/',
            headers: {
                "user-agent": useragent,
                "referer": "https://img.client.10010.com",
                "origin": "https://img.client.10010.com"
            },
            url: `/producGameApp`,
            method: 'post',
            data: transParams(params)
        })
        if (data) {
            console.log(data.msg)
        } else {
            console.log('记录失败')
        }
    }
}