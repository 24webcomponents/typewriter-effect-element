const html = String.raw
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Add some text and watch it type out in front of you.
 *
 * ```
 * <typewriter-effect></typewriter-effect>
 * ```
 */
class TypewriterEffectElement extends HTMLElement {
  static observedAttributes = ['delay']
  #renderRoot!: ShadowRoot

  async connectedCallback(): void {
    this.#renderRoot = this.attachShadow({mode: 'open'})
    this.start()
  }

  get delay(): number {
    return Math.min(Math.max(50, Number(this.getAttribute('delay')) || 100), 1000)
  }

  set delay(value: number) {
    this.setAttribute('delay', `${value}`)
  }

  async start() {
    this.#renderRoot.textContent = ''
    const walker = this.ownerDocument.createTreeWalker(this)
    let node = walker.nextNode()
    let displayNode
    const nodeStack: Array<Element|ShadowRoot> = [this.#renderRoot]
    const ms = this.delay
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        displayNode = this.ownerDocument.createTextNode('')
        nodeStack.at(-1)!.append(displayNode)
        for (let i = 0; i < node.textContent!.length; i += 1) {
          displayNode.textContent += node.textContent?.[i] ?? ''
          await delay(ms)
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        displayNode = node.cloneNode()
        nodeStack.at(-1)!.append(displayNode)
        nodeStack.push(displayNode as Element)
      }
      if (!node.nextSibling) {
        nodeStack.pop()
      }
      node = walker.nextNode()
    }
  }

  attributeChangedCallback(name: 'delay', oldValue: string|null, newValue: string|null) {
    this.start()
  }
}

declare global {
  interface Window {
    TypewriterEffectElement: typeof TypewriterEffectElement
  }
}

export default TypewriterEffectElement

if (!window.customElements.get('typewriter-effect')) {
  window.TypewriterEffectElement = TypewriterEffectElement
  window.customElements.define('typewriter-effect', TypewriterEffectElement)
}
