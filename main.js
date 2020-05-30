function $(query){
	const elements = [...document.querySelectorAll(query)]
	return (elements.length>1) ? elements : elements[0]
}
const painter = new Worker('painter.js')
const presets = [
	[
		[
			'f(a,b)',
			'|cos(a^2)+sin(b^2)|/2',
		],
		[
			'g(a,b)',
			'0',
		],
		[
			'h',
			'0',
		],
		[
			'k',
			'0',
		],
		[
			'scale',
			'1'
		],
		[
			'hue',
			'f((x-h)/scale,(y-k)/z)',
		],
		[
			'saturation',
			'1',
		],
		[
			'lum',
			'f((y-k)/scale,(x-h)/z)',
		],
	],
	[
		[
				'f(a,b)',
				'|tan(x/b)*(b-sin(a))+cos(a/b)|*a',
		],
	],
	[
			[
				'f(a,b)',
				'sin(a)^tan(a/b)',
			],
	],
			[
				'f(a,b)',
				'|tan(a/b)*(b-sin(b*a))+cos(a/b)|*a',
			]
	],
	[
		[
			'f(a,b)',
			'atan2(sin(b/a),cos(b/a))',
		],
	],
	[
		[
			'f(a,b)',
			'|cos(a/b)-tan(a/b)*(b-sin(b*a))|*a',
		],
	],
	[
		[
			'f(a,b)',
			'tan(sin(a)/b)',
		]
	],
]
let width = height = 32
let mode = 'hsl'
let fn_strings = presets[0]
const canvas_element = $('canvas')
const canvas_context = canvas_element.getContext('2d')
function handler ( event ) {
	const val = event.target.value
	if ( val ) {
		const id = event.target.id
		switch ( id ) {
			case 'width':
				width = Math.max(1,val)
				break
			case 'height':
				height = Math.max(1,val)
				break
			case 'mode':
				mode = val
				if(mode==='hsl'){
					$('channel-0').innerText='hue'
					$('channel-1').innerText='saturation'
					$('channel-2').innerText='luminosity'
				}else{
					$('channel-0').innerText='red'
					$('channel-1').innerText='green'
					$('channel-2').innerText='blue'
				}
				break
			case 'presets':
				fn_strings = presets[val]
				break
			case 'defined-f': fn_strings.defined.f = val ;break
			case 'defined-g': fn_strings.defined.g = val ;break
			case 'defined-h': fn_strings.defined.h = val ;break
			case 'defined-k': fn_strings.defined.k = val ;break
			case 'defined-scale': fn_strings.defined.z = val ;break
			case 'rendered-0': fn_strings.rendered[0] = val ;break
			case 'rendered-1': fn_strings.rendered[1] = val ;break
			case 'rendered-2': fn_strings.rendered[2] = val ;break
		}
	}
}
function sync_info () {
	$('width').value = width
	$('height').value = height
	$('mode').value = mode
	document.getElementById('width').value = width
}
function request_paint () {
	console.log('main: requesting paint...')
	painter.postMessage(JSON.stringify([width,height,mode,fn_strings]))
}
painter.onmessage = function ( image ) {
	console.log('main: received image data')
	canvas_element.width = width
	canvas_element.height = height
	canvas_context.putImageData(image.data,0,0)
	console.log('main: painted image data')
}
$('input,select').forEach(input=>{
	input.addEventListener('input',handler)
	input.addEventListener('change',request_paint)
})
$('[download]').forEach(link=>{
	link.addEventListener('click',()=>{
		link.href = canvas_element.toDataURL(`img/${link.id}`).replace(/^data:image\/[^;]*/, 'data:application/octet-stream')
	},false)
})
request_paint()
