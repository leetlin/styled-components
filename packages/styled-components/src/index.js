/* eslint-disable */
import baseStyled from './styled'

const pxRe = /-?\d*[.\d]*px/g
const base64Re = /^data:\w+\/[a-zA-Z+\-.]+;base64,/i

const px2vw = px =>
  Number(px) ? `${Math.round((Number(px) / 3.75) * 100000) / 100000}vw` : 0

const convertStringPx2vw = style => {
  if (!style) return style

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

const withCss = styled => {
  const interleave = (strings, ...interpolations) => {
    strings = strings.map(convertStringPx2vw)

    interpolations = interpolations.map(convertInterpolationPx2vw)

    return styled(strings, ...interpolations)
  }

  Object.keys(styled).forEach(
    prop => (interleave[prop] = withTemplateFunc(styled[prop])),
  )

  return interleave
}

const withTemplateFunc = styled => (...props) => withCss(styled(...props))

const styled = (styled => {
  const obj = withTemplateFunc(styled)

  Object.keys(styled).forEach(key => {
    obj[key] = withCss(styled[key])

    Object.keys(styled[key]).forEach(
      prop => (obj[key][prop] = withTemplateFunc(styled[key][prop])),
    )
  })

  return obj
})(baseStyled)

export default styled
export { px2vw }
export * from './styled'
