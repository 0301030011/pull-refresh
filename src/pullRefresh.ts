class pullRefresh {
    selector: string;
    allowScrollElement: HTMLElement;
    pullHeight: number;
    pullMessage: string;
    holdMessage: string;
    refreshMessage: string;
    refreshEndMessage: string;
    transitionDuration: string;

    fireEvent: (fireEventEnd: () => void) => void;


    isRefreshFlag: boolean = false;
    fireFlag: boolean = false;
    pullContent: HTMLElement;
    startY: number;
    distanceY: number;
    lastY: number;
    pullInfo: HTMLElement;

    pullStartWithThis: (e: TouchEvent) => void;
    pullMoveWithThis: (e: TouchEvent) => void;
    pullEndWithThis: (e: TouchEvent) => void;

    constructor(options: { selector: string, allowScrollElement: string, pullHeight: number, pullMessage: string, holdMessage: string, refreshMessage: string, refreshEndMessage: string, transitionDuration: string }, fireEvent: (fireEventEnd: () => void) => void) {
        this.selector = options.selector;
        let allowScrollElement = options.allowScrollElement || 'body';
        this.allowScrollElement = <HTMLElement>document.querySelector(allowScrollElement);
        this.pullHeight = options.pullHeight || 44;
        this.pullMessage = options.pullMessage || '下拉以刷新数据...';
        this.holdMessage = options.holdMessage || '松开刷新';
        this.refreshMessage = options.refreshMessage || '刷新中...';
        this.refreshEndMessage = options.refreshEndMessage || '刷新完成';
        this.transitionDuration = options.transitionDuration || '200ms';
        this.pullContent = <HTMLElement>document.querySelector(this.selector);
        this.fireEvent = fireEvent;

        this.pullStartWithThis = this.pullStart.bind(this);
        this.pullMoveWithThis = this.pullMove.bind(this);
        this.pullEndWithThis = this.pullEnd.bind(this);

        this.init();
    }

    init() {
        this.addStyle();
        this.setPullRefresh();
    }

    addStyle() {
        let style = document.createElement('style');
        let pullTop = this.pullContent.offsetTop;
        style.innerHTML = `.pull-info { max-height: ${ this.pullHeight }px; height: 0; line-height: 0; position: absolute; width: 100%; top: ${ pullTop }px; left: 0; right: 0; text-align: center; z-index: 1; }
        .pull-hide { display: none!important; }`;
        document.querySelector('head').appendChild(style);
    }

    setPullRefresh() {
        this.pullInfo = document.createElement('div');
        this.pullInfo.className = 'pull-info pull-hide';
        this.pullContent.parentElement.insertBefore(this.pullInfo, this.pullContent);
        this.pullContent.addEventListener('touchstart', this.pullStartWithThis, false);
    }

    pullStart(e: TouchEvent) {
        // if (this.isRefreshFlag || this.pullContent.scrollTop > 0 || this.allowScrollElement.scrollTop > 0) {
        //     return;
        // }
        if (this.isRefreshFlag) {
            return;
        }
        this.pullInfo.innerHTML = this.pullMessage;
        this.startY = e.touches[0].pageY;
        e.currentTarget.addEventListener('touchmove', this.pullMoveWithThis, false);
        e.currentTarget.addEventListener('touchend', this.pullEndWithThis, false);
    }
    
    pullMove(e: TouchEvent) {
        if (this.pullContent.scrollTop > 0 || this.allowScrollElement.scrollTop > 0) {
            return;
        }
        let currentY = e.touches[0].pageY;
        this.distanceY = currentY - this.startY;
        if (this.lastY > currentY && this.distanceY > 0) {
            e.preventDefault();//阻止默认滚动事件
        }
        this.lastY = currentY;
        if (this.distanceY <= 0) {
            this.receiveContent();
            // e.currentTarget.removeEventListener('touchmove', this.pullMoveWithThis, false);
            // e.currentTarget.removeEventListener('touchend', this.pullEndWithThis, false);
            return;
        }
        this.pullInfo.classList.remove('pull-hide');
        this.moveContent();
    }

    moveContent() {
        let distanceYStr = `${ this.distanceY }px`;
        if (this.distanceY < this.pullHeight) {
            this.pullInfo.style.height = distanceYStr;
            this.pullInfo.style.lineHeight = distanceYStr;
            this.pullContent.style.transform = `translateY(${ distanceYStr })`;
            if (this.fireFlag) {
                this.fireFlag = false;
                this.pullInfo.innerHTML = this.pullMessage;
            }
        } else {
            if (!this.fireFlag) {
                let pullHeightStr = `${ this.pullHeight }px`;
                this.pullInfo.innerHTML = this.holdMessage;
                this.pullInfo.style.height = pullHeightStr;
                this.pullInfo.style.lineHeight = pullHeightStr;
                this.fireFlag = true;
            }
            this.pullInfo.style.transform = `translateY(${ this.distanceY - this.pullHeight }px)`;
            this.pullContent.style.transform = `translateY(${ distanceYStr })`;
        }
    }

    pullEnd(e: TouchEvent) {
        e.currentTarget.removeEventListener('touchmove', this.pullMoveWithThis, false);
        e.currentTarget.removeEventListener('touchend', this.pullEndWithThis, false);
        if (!this.fireFlag) {
            this.receiveContent();
            return;
        }
        this.bounceContent();
    }

    receiveContent() {
        this.setTransitionDuration(this.transitionDuration);
        this.pullContent.style.transform = 'translateY(0)';
        this.pullInfo.style.height = '0';
        this.pullInfo.style.lineHeight = '0';
        this.pullInfo.classList.add('pull-hide');
        this.fireFlag = false;
        setTimeout(() => {
            this.setTransitionDuration(0);
        });
    }

    bounceContent() {
        this.setTransitionDuration(this.transitionDuration);
        let pullHeightStr = `${ this.pullHeight }px`;
        this.pullContent.style.transform = `translateY(${ pullHeightStr })`;
        this.pullInfo.style.transform = 'translateY(0)';
        this.pullInfo.style.height = pullHeightStr;
        this.pullInfo.style.lineHeight = pullHeightStr;
        setTimeout(() => {
            this.pullInfo.innerHTML = this.refreshMessage;
            this.isRefreshFlag = true;
            this.setTransitionDuration(0);
            this.fireEvent(this.fireEventFinish.bind(this));
        }, this.transitionDuration);
    }

    fireEventFinish() {
        this.pullInfo.innerHTML = this.refreshEndMessage;
        this.isRefreshFlag = false;
        this.receiveContent();
    }

    setTransitionDuration(duration: number): void;

    setTransitionDuration(duration: string): void;

    setTransitionDuration(duration): void {
        if (typeof duration == 'number') {
            duration = `${ duration }ms`
        }
        this.pullContent.style.transitionDuration = duration;
        this.pullInfo.style.transitionDuration = duration;
    }
}