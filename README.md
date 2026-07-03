<h1 style="text-align: center;" align="center">
浙江电信IPTV节目列表整理与分析
</h1>

## 目录

- [项目简介](#项目简介)
- [频道分辨率及有效性报告](#频道分辨率及有效性报告)
- [项目文件说明](#项目文件说明)
- [免责声明 / Disclaimer](#免责声明--disclaimer)

---

## 项目简介

本项目从互联网收集整理浙江电信IPTV的组播源与单播源信息，以及`.m3u`、`.txt`、`.csv`格式的列表与台标。

> ⚠️特别提示：本项目中的全部内容均来自互联网整理收集，仅用作统计电信IPTV上线的节目列表，所有内容不保证准确性，仅供参考。所提供单播和组播地址仅供格式参考，如需实际查看，必须购买中国电信IPTV服务并使用附带的机顶盒播放。

## 频道分辨率及有效性报告

本项目定期从互联网收集频道分辨率及有效性，并提供报告：

- [浙江组播源检测报告](https://myepg.org/Zhejiang_Multicast/report.html)
- [浙江单播源检测报告](https://myepg.org/Zhejiang_Unicast/report.html)

## 项目文件说明


#### 浙江组播（Zhejiang_Multicast）：


- `Zhejiang_Multicast.m3u`：使用本地台标的m3u列表。
- `Zhejiang_Multicast_OL.m3u`：使用在线台标的m3u列表。
- `Zhejiang_Multicast.txt`：txt格式频道列表。
- `Zhejiang_Multicast.csv`：频道清单。

#### 杭州单播（Zhejiang_Unicast）：


- `Zhejiang_Unicast.m3u`：使用本地台标的m3u列表。
- `Zhejiang_Unicast_OL.m3u`：使用在线台标的m3u列表。
- `Zhejiang_Unicast.txt`：txt格式频道列表。
- `Zhejiang_Unicast.csv`：频道清单。

#### 链接形式列表

```
https://myepg.org/api/subscribe/{source}/{type}
```

##### 参数说明：

| 参数名 | 示例值 | 必填 | 说明 |
|--------|--------|:----:|------|
| `source` | `multicast` 或 `unicast` | 是 | 数据源类型，组播或单播 |
| `type` | `m3u` 或 `txt` | 是 | 输出文件格式 |
| `udpxy` | `10.30.0.1:2340` | 组播必填 | 格式为 IPv4:端口 |
| `logo` | `logo.example.com` 或 `192.168.1.2:8080` | 否 | 仅当 `type=m3u` 时有效，替换模板中的 `{{your_logo_address}}` |
| `ip` | `10.0.0.1` | 否 | 仅当 `source=unicast` 时有效，替换 RTSP URL 中的 IP 地址 |
| `nocache` | - | 否 | 拒绝使用缓存 |

##### 示例请求

```
# 组播M3U，使用在线台标
https://myepg.org/api/subscribe/multicast/m3u?udpxy=192.168.1.1:2345

# 组播TXT
https://myepg.org/api/subscribe/multicast/txt?udpxy=192.168.1.1:2345

# 组播M3U，使用自定义台标
https://myepg.org/api/subscribe/multicast/m3u?udpxy=192.168.1.1:2345&logo=192.168.1.1:8090

# 单播M3U
https://myepg.org/api/subscribe/unicast/m3u

# 单播M3U，替换RTSP中的IP
https://myepg.org/api/subscribe/unicast/m3u?ip=x.x.x.x

# 单播M3U，拒绝缓存
https://myepg.org/api/subscribe/unicast/m3u?nocache
```

---

# 免责声明 / Disclaimer

## 1. 本项目仅供学习与研究用途

本项目所载之全部内容均衍生自互联网公开渠道的技术整理，仅供个人技术交流与研究参考， 禁止用于任何商业用途，亦不保证任何数据的时效性或准确性。

## 2. 项目提示

本项目中列出的所有内容仅供统计浙江电信IPTV上线的节目列表，不可访问。本项目本身**不提供、不托管、不分发**任何实质性的音视频流媒体内容，亦**不提供任何破解、模拟或绕过认证的工具或方法**。

如需播放本项目列出的节目清单，则必须订购浙江电信IPTV服务，并通过IPTV服务服务提供的机顶盒播放。

## 3. 内容版权说明

项目中提及或内嵌的频道名称、台标（Logo）、节目单等，均来源于网络收集。版权归属原版权方或电信运营商所有。项目仅用于格式演示与技术分析。

如本项目内容侵犯了您的权益，请[联系我们](mailto:lionixqiu@gmail.com)，我们将立即处理。

## 4. 责任免除声明

本项目作者不持有任何IPTV内容的版权，也不对任何使用本项目所引发的问题承担责任。**使用者对本项目的任何形式的使用必须自行承担一切风险和后果。**

---

> ⚠️ 请合理合法使用本项目内容，禁止用于任何违反当地法律或运营商规定的行为。
