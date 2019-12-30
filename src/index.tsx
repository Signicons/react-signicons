import React, { FunctionComponent } from 'react'
import { SigniconsInterface } from './icons'

interface IconProps {
	symbol: SigniconsInterface
}

const Signicon: FunctionComponent<IconProps> = (props: IconProps) => {
	const { symbol } = props
	return (
		<svg
			id={symbol.title}
			xmlns={symbol.xmlns}
			viewBox={symbol.viewBox}
			width={symbol.width}
			height={symbol.height}>
			<path
				d={symbol.path}
				fill={symbol.color} />
		</svg>
	)
}

export default Signicon
export * from './icons'