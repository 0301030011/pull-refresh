class pullRefresh {
    selector: string;
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
    pullInfo: HTMLElement;

    constructor(options: { selector: string, pullHeight: number, pullMessage: string, holdMessage: string, refreshMessage: string, refreshEndMessage: string, transitionDuration: string }, fireEvent: (fireEventEnd: () => void) => void) {
        this.selector = options.selector;
        this.pullHeight = options.pullHeight || 44;
        this.pullMessage = options.pullMessage || '下拉以刷新数据...';
        this.holdMessage = options.holdMessage || '松开刷新';
        this.refreshMessage = options.refreshMessage || '刷新中...';
        this.refreshEndMessage = options.refreshEndMessage || '刷新完成';
        this.transitionDuration = options.transitionDuration || '200ms';
        this.pullContent = <HTMLElement>document.querySelector(this.selector);
        this.fireEvent = fireEvent;
        this.init();
    }

    init() {
        this.addStyle();
        this.setPullRefresh();
    }

    addStyle() {
        let style = document.createElement('style');
        let pullTop = this.pullContent.offsetTop;
        style.innerHTML = `.pull-info { max-height: ${ this.pullHeight }px; height: 0; line-height: 0; position: absolute; width: 100%; top: ${ pullTop }px; left: 0; right: 0; text-align: center; z-index: -1; }
        .pull-hide { display: none!important; }`;
        document.querySelector('head').appendChild(style);
    }

    setPullRefresh() {
        this.pullInfo = document.createElement('div');
        this.pullInfo.className = 'pull-info pull-hide';
        document.getElementsByTagName('body')[0].insertBefore(this.pullInfo, this.pullContent);
        this.pullContent.addEventListener('touchstart', this.pullStart.bind(this), false);
    }

    pullStart(e: TouchEvent) {
        if (this.isRefreshFlag) {
            return;
        }
        this.pullInfo.innerHTML = this.pullMessage;
        this.pullInfo.classList.remove('pull-hide');
        this.startY = e.touches[0].pageY;
        e.target.addEventListener('touchmove', this.pullMove.bind(this), false);
        e.target.addEventListener('touchend', this.pullEnd.bind(this), false);
    }

    pullMove(e: TouchEvent) {
        let currentY = e.touches[0].pageY;
        this.distanceY = currentY - this.startY;
        if (this.distanceY <= 0 || this.pullContent.scrollTop > 0) {
            e.target.removeEventListener('touchmove', this.pullMove, false);
            return;
        }
        this.moveContent();
    }

    moveContent() {
        let distanceYStr = `${ this.distanceY }px`;
        if (this.distanceY < this.pullHeight) {
            this.pullInfo.style.height = distanceYStr;
            this.pullInfo.style.lineHeight = distanceYStr;
            this.pullContent.style.transform = `translateY(${ distanceYStr })`;
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
        e.target.removeEventListener('touchmove', this.pullMove, false);
        e.target.removeEventListener('touchend', this.pullEnd, false);
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