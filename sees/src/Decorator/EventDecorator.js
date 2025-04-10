// EventComponent.js
export class EventComponent {
    constructor(eventOrComponent) {
        this.component = eventOrComponent; // can be another component or the base event
    }

    getTitle() {
        if (typeof this.component.getTitle === 'function') {
            return this.component.getTitle();
        }
        return this.component.title;
    }

    getPrice() {
        if (typeof this.component.getPrice === 'function') {
            return this.component.getPrice();
        }
        return this.component.price;
    }
}

export class VIPEventDecorator extends EventComponent {
    getTitle() {
        return `🌟 VIP: ${super.getTitle()}`;
    }
}

export class CertificationEventDecorator extends EventComponent {
    getTitle() {
        return `${super.getTitle()} 🏅 Certification Available`;
    }
}

export class DiscountEventDecorator extends EventComponent {
    getTitle() {
        return `Discounted: ${super.getTitle()}`;
    }

    getPrice() {
        return super.getPrice() * 0.9;
    }
}