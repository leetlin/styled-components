import baseStyled from './styled'

const pxRe = /-?\d*[.\d]*px/g
const base64Re = /^data:\w+\/[a-zA-Z+\-.]+;base64,/i

const px2vw = px =>
  Number(px) ? `${Math.round((Number(px) / 3.75) * 100000) / 100000}vw` : 0

const convertStringPx2vw = _style => {
  if (!_style) return _style
  const style = _style;

  if (
    Object.prototype.toString.call(style) === '[object Object]' &&
    style.constructor.name === 'Keyframes'
  ) {
    style.rules = style.rules.map(convertStringPx2vw)
    return style
  } else if (
    !base64Re.test(style) && // no-base64
    pxRe.test(style) // include px unit
  ) {
    return style.replace(pxRe, value => px2vw(value.replace('px', '')))
  }

  return style
}

const convertInterpolationPx2vw = interpolation => {
  if (typeof interpolation !== 'function') return interpolation

  return props => {
    const result = interpolation(props)

    if (typeof result === 'string') {
      return convertStringPx2vw(result)
    }

    if (Array.isArray(result)) {
      return result.map(convertStringPx2vw)
    }

    return result
  }
}

// eslint-disable-next-line
const withTemplateFunc = _styled => (...props) => withCss(_styled(...props))

const withCss = _styled => {
  const interleave = (strings, ...interpolations) => {
    const _strings = strings.map(convertStringPx2vw)
    const _interpolations = interpolations.map(convertInterpolationPx2vw)

    return _styled(_strings, ..._interpolations)
  }

  Object.keys(_styled).forEach(
    prop => (interleave[prop] = withTemplateFunc(_styled[prop])),
  )

  return interleave
}

const styled = (_styled => {
  const obj = withTemplateFunc(_styled)

  Object.keys(_styled).forEach(key => {
    obj[key] = withCss(_styled[key])

    Object.keys(_styled[key]).forEach(
      prop => (obj[key][prop] = withTemplateFunc(_styled[key][prop])),
    )
  })

  return obj
})(baseStyled)

export default styled
export { px2vw }
export * from './styled'
