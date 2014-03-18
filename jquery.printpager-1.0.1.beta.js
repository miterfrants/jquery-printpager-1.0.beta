/*========================options=====================================*/
//paperH 紙張高度:decimal 單位 mm
//paperW 紙張寬度:decimal 單位 mm
//padding 紙張出血: decimal array  單位 mm
//loop_class 換頁欄的 class default:"page-variable"
//page_end_class 放在最後一頁的 class default:"page-end"
//current_page_string 頁碼 class default:"{CurrentPage}"
//total_page_string 頁數 class default:"{TotalPage}"
//page_append_class 補在最後一頁後面 class default:"page-append"
//page_isolate_fixed_class 如果高度超過 就放到最後面 沒有頭尾 class default:"fix-end"
//bug 如果table 沒有 border-collspan 會算錯高度 ---已處理 20130510
PrintSplice = {
    CONST: {
        TEST_PAPER_SIZE_CLASS: "test-paper-size",
        //拿來算高度Loop
        LOOP_CLASS: "page-variable",
        LOOP_MARK_CLASS: "page-temp-variable",
        LOOP_HEAD_CLASS: "page-variable-head",
        //放在最後一頁的後面　
        PAGE_END_CLASS: "page-end",
        PAGE_END_MARK_CLASS: "page-temp-end",
        //頁碼
        CURRENT_PAGE_STRING: "{CurrentPage}",
        //頁數
        TOTAL_PAGE_STRING: "{TotalPage}",
        //補在最後一頁後面
        PAGE_APPEND_CLASS: "page-append",
        PAGE_APPEND_MARK_CLASS: "page-temp-append",
        //如果高度超過 就放到最後面 沒有頭尾
        PAGE_ISOLATE_FIXEND_CLASS: "fix-end"
    },
    ini: function (target, option) {
        var splice = {
            //paperW not work now;
            rebuildDOM: function () {
                var parTagName = $("." + PrintSplice.CONST.LOOP_CLASS + ":eq(0)").parent()[0].tagName;
                var isolateFixPage = $("<" + parTagName + "></" + parTagName + ">");
                $("body").append("<div class=\"" + PrintSplice.CONST.TEST_PAPER_SIZE_CLASS + "\" style=\"height:" + this.paperH + "mm;width:" + this.paperW + "mm;position:absolute\"></div>");
                var pageH = $("." + PrintSplice.CONST.TEST_PAPER_SIZE_CLASS).height();
                //console.log("pageH:" + pageH);
                //console.log(this.padding[0]);

                var pageW = $("." + PrintSplice.CONST.TEST_PAPER_SIZE_CLASS).width();
                var rate = pageW / this.paperW;
                //                console.log("pageH:" + pageH);
                //                console.log("rate:" + rate);
                //                console.log("paddingTop:" + this.padding[0] * rate);
                //                console.log("paddingBottom:" + this.padding[2] * rate);
                //                console.log("pageW:" + pageW);
                //                console.log("paddingRight:" + this.padding[1] * rate);
                //                console.log("paddingLeft:" + this.padding[3] * rate);
                //                console.log("扣掉pannding pageH:" + (Number(pageH) - Number(this.padding[0] * rate) - Number(this.padding[2] * rate)));
                //                console.log("扣掉pannding pageW:" + (Number(pageH) - Number(this.padding[1] * rate) - Number(this.padding[3] * rate)));
                //把頁面高度換成頁面寬高
                this.target.css({ "width": Number(pageW) - Number((this.padding[1] + this.padding[3]) * rate) + "px", "height": Number(pageH) - Number((this.padding[0] + this.padding[2]) * rate) + "px", "padding-top": (this.padding[0] * rate) + "px", "padding-right": (this.padding[1] * rate) + "px", "padding-bottom": (this.padding[2] * rate) + "px", "padding-left": (this.padding[3] * rate) + "px" });
                var pageAppend = $("." + PrintSplice.CONST.PAGE_APPEND_CLASS);
                var appendHeight = pageAppend.outerHeight();
                $("." + PrintSplice.CONST.PAGE_APPEND_CLASS, this.target).replaceWith("<div class=\"" + PrintSplice.CONST.PAGE_APPEND_MARK_CLASS + "\"></div>");

                var currHeight = 0;
                var pageEndHeight = 0;
                var fixHeight = 0;
                var pageEnd;
                $("." + PrintSplice.CONST.TEST_PAPER_SIZE_CLASS).remove();

                var els = $("." + PrintSplice.CONST.LOOP_CLASS, this.target);
                var arrElsH = new Array();
                for (var i = 0; i < els.length; i++) {
                    arrElsH[i] = els.eq(i).outerHeight();
                    console.log(els.eq(i).outerHeight());
                    if (els.eq(0)[0].tagName.toLowerCase() == "tr" && els.eq(0).parent().parent().css("border-collapse") != "collapse") {
                        arrElsH[i] += Number(els.eq(0).parent().css("border-spacing").split(" ")[0].replace(/px/gi, ""));
                    }
                }
                //get page end and height
                if ($("." + PrintSplice.CONST.PAGE_END_CLASS, this.target).length > 0) {
                    pageEndHeight = $("." + PrintSplice.CONST.PAGE_END_CLASS, this.target).height();
                    pageEnd = $("." + PrintSplice.CONST.PAGE_END_CLASS, this.target);
                }
                //insert mark to restore data
                $("." + PrintSplice.CONST.LOOP_CLASS + ":eq(0)", this.target).replaceWith("<div class=\"" + PrintSplice.CONST.LOOP_MARK_CLASS + "\"></div>");
                $("." + PrintSplice.CONST.LOOP_CLASS, this.target).remove();
                $("." + PrintSplice.CONST.PAGE_END_CLASS, this.target).replaceWith("<div class=\"" + PrintSplice.CONST.PAGE_END_MARK_CLASS + "\"></div>");
                //fix page 
                var fixPage = target.clone();
                var pageChild = target.children();
                for (var i = 0; i < pageChild.length; i++) {
                    fixHeight += pageChild.eq(i).outerHeight(true);
                }
                //caculate variable block
                var appendTempEls = $("<div></div>");
                var tmpResult = $("<div></div>");
                currHeight = fixHeight;
                var currPage = 0;
                var regCurrentPage = RegExp(PrintSplice.CONST.CURRENT_PAGE_STRING, "gi");
                var regTotalPage = RegExp(PrintSplice.CONST.TOTAL_PAGE_STRING, "gi");

                // Isolate fixed page
                console.log("pageH:" + pageH);
                var threadHeight = (Number(pageH) - Number(this.padding[0] * rate) - Number(this.padding[2] * rate));
                console.log("fixHeight:" + fixHeight);
                //console.log("去掉變動欄位高度:"+fixHeight);
                for (var i = 0; i < arrElsH.length; i++) {
                    if ((currHeight + arrElsH[i] > (Number(pageH) - Number(this.padding[0] * rate) - Number(this.padding[2] * rate))) || (i == arrElsH.length - 1 && currHeight + pageEndHeight > (Number(pageH) - Number(this.padding[0] * rate) - Number(this.padding[2] * rate)))) {
                        //console.log("建立頁面")
                        if (els.eq(i).hasClass(PrintSplice.CONST.PAGE_ISOLATE_FIXEND_CLASS) && currPage >= 2) {
                            isolateFixPage.append(appendTempEls.children());
                        } else {
                            var tempFixPage = fixPage.clone();
                            //console.log(appendTempEls.children())
                            $("." + PrintSplice.CONST.LOOP_MARK_CLASS, tempFixPage).replaceWith(appendTempEls.children());
                            if (currPage != 0) {
                                tempFixPage.css({ "page-break-before": "always" })
                            }
                            tmpResult.append(tempFixPage);
                            tempFixPage = null;
                            appendTempEls = $("<div></div>");
                            currHeight = fixHeight;
                            currPage += 1;
                            //如果換頁了要把 page-variable 然後參數有 beforeAppend 做附加到換頁的第一塊
                            if (this.beforeAppend.length > 0 && this.beforeAppendNum > 0) {
                                //如果下一頁的資料的前面beforeAppendNum的數量是beforeAppend的class就不做這件事了
                                var continueHeadCount = 0;
                                console.log(els.eq(i));
                                for (var j = 0; j < this.beforeAppendNum - 1; j++) {
                                    console.log(els.eq(i + j + 1));
                                    if (els.eq(i + j + 1).hasClass(this.beforeAppend.replace(/\./gi, ""))) {
                                        continueHeadCount += 1
                                    }
                                }
                                //如果開頭是沒有表頭的話就做beforeAppend
                                if (continueHeadCount = 0) {
                                    var beforeAppendEL = new Array();
                                    //找到第一頁表頭有幾個。怕一頁有很多個
                                    //抓上一頁的所有page variable 迴圈爬，倒數且連續的兩筆before append。
                                    //如果沒有連續就會把 .head 在這頁移除加到下一頁。
                                    //currHeight 變零，然後再把 i重作一次
                                    //這個晚點考慮，先做beforeAppendEL
                                    var prePageChildren = $(".page:eq(" + (currPage - 1) + ") ." + PrintSplice.CONST.LOOP_CLASS, tmpResult);
                                    console.log(prePageChildren.length)
                                    var isHeadStart = false;
                                    var tempPrePageAppendCount = 0;
                                    for (var j = prePageChildren.length - 1; j >= 0; j--) {
                                        if (prePageChildren.eq(j).hasClass(this.beforeAppend.replace(/\./gi, ""))) {
                                            //連續等一下再處理。
                                            beforeAppendEL.push(prePageChildren.eq(j).clone());
                                        }
                                    }
                                    for (var j = beforeAppendEL.length - 1; j >= 0; j--) {
                                        currHeight -= beforeAppendEL[j].outerHeight(true);
                                        appendTempEls.append(beforeAppendEL[j]);
                                    }
                                }
                            }
                            if ($("." + PrintSplice.CONST.SECOND_PAGE_REMOVE_CLASS, fixPage).length > 0) {
                                $("." + PrintSplice.CONST.SECOND_PAGE_REMOVE_CLASS, fixPage).remove();
                            }
                            if (!this.isTotalPageNum) {
                                tmpResult.html(tmpResult.html().replace(regCurrentPage, currPage));
                            }
                            this.totalPage += 1;
                        }
                    }
                    //最後一個但加了page end就超過高度 要另外處理
                    currHeight += arrElsH[i];
                    //console.log((i+1)+":現在高度:" + currHeight);
                    appendTempEls.append(els.eq(i));
                    if (i == arrElsH.length - 1) {
                        //console.log("最後一筆資料建立頁面")
                        //如果換頁的變數高度，包含 page isolate fixend class 就拿到最後面去; isolateFixPage用來存這些裝不下的child
                        if (els.eq(i).hasClass(PrintSplice.CONST.PAGE_ISOLATE_FIXEND_CLASS) && currPage >= 1) {
                            isolateFixPage.append(appendTempEls.children());
                        } else {
                            var tempFixPage = fixPage.clone();
                            //tempFixPage 包含頭尾的template
                            //appendTempEls.children 這個頁面會增加的列
                            $("." + PrintSplice.CONST.LOOP_MARK_CLASS, tempFixPage).replaceWith(appendTempEls.children());
                            tmpResult.append(tempFixPage);
                            //初始化
                            if (currPage != 0) {
                                tempFixPage.css({ "page-break-before": "always" })
                            }
                            tempFixPage = null;
                            appendTempEls = $("<div></div>");
                            currPage += 1;
                            //如果換頁了要把 page-variable 然後參數有 beforeAppend 做附加到換頁的第一塊
                            if (this.beforeAppend.length > 0) {
                                var beforeAppendEL = null
                                if (this.beforeAppendNum > 0) {
                                    beforeAppendEL = $(".page:eq(" + (currPage - 1) + ") " + this.beforeAppend + ":lt(" + this.beforeAppendNum + ")", tmpResult).clone();
                                } else {
                                    beforeAppendEL = $(".page:eq(" + (currPage - 1) + ") " + this.beforeAppend, tmpResult).clone();
                                }
                                for (var j = 0; j < beforeAppendEL.length; j++) {
                                    currHeight -= beforeAppendEL.eq(j).outerHeight(true);
                                }
                                appendTempEls.append(beforeAppendEL);
                                //console.log(appendTempEls[0].outerHTML);
                            }
                            if (pageEndHeight > 0) {
                                $("." + PrintSplice.CONST.PAGE_END_MARK_CLASS, tmpResult).last().replaceWith(pageEnd)
                                $("." + PrintSplice.CONST.PAGE_END_MARK_CLASS).remove();
                            }

                            if ($("." + PrintSplice.CONST.SECOND_PAGE_REMOVE_CLASS, fixPage).length > 0) {
                                $("." + PrintSplice.CONST.SECOND_PAGE_REMOVE_CLASS, fixPage).remove();
                            }
                            if (!this.isTotalPageNum) {
                                tmpResult.html(tmpResult.html().replace(regCurrentPage, currPage));
                            }
                            this.totalPage += 1;
                        }
                    }
                }
                if (currHeight + appendHeight > threadHeight) {
                    tmpResult.append(fixPage.clone().html(pageAppend));
                } else {
                    $("." + PrintSplice.CONST.PAGE_APPEND_MARK_CLASS, tmpResult).last().replaceWith(pageAppend);
                }
                $("." + PrintSplice.CONST.PAGE_APPEND_MARK_CLASS, tmpResult).remove();
                if (isolateFixPage.children().length > 0) {
                    isolateFixPage.css("page-break-before", "always");
                    target.after(isolateFixPage);
                }
                if (arrElsH.length != 0) {
                    if (!this.isTotalPageNum) {
                        target.replaceWith(tmpResult[0].innerHTML.replace(regTotalPage, this.totalPage));
                    } else {
                        target.replaceWith(tmpResult[0].innerHTML);
                    }
                }

            },
            target: null,
            paperH: 0,
            paperW: 0,
            padding: [0, 0, 0, 0], // top rigth bottom left
            totalPage: 0,
            isReapeatHead: false, //如果遇到 page-variable 跨頁，要不要重覆page-variable 的head
            isTotalPageNum: false,
            beforeAppend: "",
            beforeAppendNum: 0
        }
        //建立splice 物件物件的rebuildDOM 這個是主要切分頁的程式。
        for (var okey in option) {
            for (var key in splice) {
                if (key == okey) {
                    splice[key] = option[okey];
                }
            }
            for (var key in PrintSplice.CONST) {
                if (String(key).toLowerCase() == key) {
                    PrintSplice.CONST[key] = option[okey]
                }
            }
        }
        splice.target = target;
        return splice;
    }
}
$.fn.printSplice = function (option) {
    var ps
    if ($(this).length > 1) {
        for (var i = 0; i < $(this).length; i++) {
            ps = PrintSplice.ini($(this).eq(i), option);
            ps.rebuildDOM();
        }
    } else {
        ps = PrintSplice.ini($(this), option);
        ps.rebuildDOM();
    }
    if (ps.isTotalPageNum) {
        var pageEls = $(".page");
        var totalPage = pageEls.length;
        var regCurrentPage = RegExp(PrintSplice.CONST.CURRENT_PAGE_STRING, "gi");
        var regTotalPage = RegExp(PrintSplice.CONST.TOTAL_PAGE_STRING, "gi");
        //順序不同 會沒取代到 {CurrentPage}
        //console.log(this) 查一下this 
        for (var i = 0; i < pageEls.length; i++) {
            $(".page:eq(" + i + ")").html($(".page:eq(" + i + ")").html().replace(regCurrentPage, i + 1));
            if (i != 0) {
                $(".page:eq(" + i + ")").css("page-break-before", "always")
            }
            
        }
        $("body").html($("body").html().replace(regTotalPage, pageEls.length));
    }
}