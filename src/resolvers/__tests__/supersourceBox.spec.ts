import * as supersource from '../supersource'
import { State as StateObject, Defaults } from '../../'
import { Commands, Enums } from 'atem-connection'
import { SuperSourceBoxParametersCommand } from 'atem-connection/dist/commands'

const STATE1 = new StateObject()
STATE1.video.superSources[0] = {
	index: 0,
	boxes: { 0: JSON.parse(JSON.stringify(Defaults.Video.SuperSourceBox)) },
	border: JSON.parse(JSON.stringify(Defaults.Video.SuperSourceBorder)),
	properties: JSON.parse(JSON.stringify(Defaults.Video.SuperSourceProperties))
}
const STATE2 = new StateObject()
STATE2.video.superSources[0] = {
	index: 0,
	boxes: { 0: {
		enabled: true,
		source: 1,
		x: 1,
		y: 1,
		size: 1,
		cropped: true,
		cropTop: 1,
		cropBottom: 1,
		cropLeft: 1,
		cropRight: 1
	} },
	border: JSON.parse(JSON.stringify(Defaults.Video.SuperSourceBorder)),
	properties: JSON.parse(JSON.stringify(Defaults.Video.SuperSourceProperties))
}

test('Unit: super source boxes: same state gives no commands', function () {
	// same state gives no commands:
	const commands = supersource.resolveSuperSourceState(STATE1, STATE1, Enums.ProtocolVersion.V7_2)
	expect(commands.length).toEqual(0)
})

test('Unit: super source boxes: status command', function () {
	const commands = supersource.resolveSuperSourceState(STATE1, STATE2, Enums.ProtocolVersion.V7_2) as Array<Commands.SuperSourceBoxParametersCommand>

	expect(commands[0].rawName).toEqual('CSBP')
	expect(commands[0].boxId).toEqual(0)
	expect(commands[0].flag).toEqual(1023)
	expect(commands[0].properties).toMatchObject({
		enabled: true,
		source: 1,
		x: 1,
		y: 1,
		size: 1,
		cropped: true,
		cropTop: 1,
		cropBottom: 1,
		cropLeft: 1,
		cropRight: 1
	})
})

test('Unit: super source boxes: box removed', function () {
	const ssBox = STATE2.video.superSources[0].boxes[0]
	delete STATE2.video.superSources[0].boxes[0]
	const commands = supersource.resolveSuperSourceState(STATE1, STATE2, Enums.ProtocolVersion.V7_2) as Array<Commands.SuperSourceBoxParametersCommand>

	expect(commands.length).toEqual(0)

	STATE2.video.superSources[0].boxes[0] = ssBox
})

test('Unit: super source boxes: new box', function () {
	// const ssBox = STATE1.video.superSources[0].boxes[0]
	delete STATE1.video.superSources[0].boxes[0]
	const commands = supersource.resolveSuperSourceState(STATE1, STATE2, Enums.ProtocolVersion.V7_2) as Array<Commands.SuperSourceBoxParametersCommand>

	expect(commands[0].rawName).toEqual('CSBP')
	expect(commands[0].boxId).toEqual(0)
	expect(commands[0].flag).toEqual(1023)
	expect(commands[0].properties).toMatchObject({
		enabled: true,
		source: 1,
		x: 1,
		y: 1,
		size: 1,
		cropped: true,
		cropTop: 1,
		cropBottom: 1,
		cropLeft: 1,
		cropRight: 1
	})

	STATE1.video.superSources[0].boxes[0] = STATE2.video.superSources[0].boxes[0]
})

test('Unit: super source properties: same state gives no commands', function () {
	// same state gives no commands:
	const commands = supersource.resolveSuperSourcePropertiesState(STATE1, STATE1)
	expect(commands.length).toEqual(0)
})

test('Unit: super source properties: some properties changed', function () {
	STATE2.video.superSources[0].properties.artFillSource = 3010
	STATE2.video.superSources[0].properties.artOption = 1 // foreground
	const commands = supersource.resolveSuperSourcePropertiesState(STATE1, STATE2)
	expect(commands.length).toEqual(1)

	expect(commands[0].rawName).toEqual('CSSc')
	expect(commands[0].flag).toEqual(5)
	expect(commands[0].properties).toMatchObject({
		artFillSource: 3010,
		artOption: 1
	})

	STATE2.video.superSources[0].properties.artFillSource = STATE1.video.superSources[0].properties.artFillSource
	STATE2.video.superSources[0].properties.artOption = STATE1.video.superSources[0].properties.artOption
})

test('Unit: super source properties v8: some properties changed', function () {
	STATE2.video.superSources[0].properties.artFillSource = 3010
	STATE2.video.superSources[0].properties.artOption = 1 // foreground
	const commands = supersource.resolveSuperSourcePropertiesV8State(STATE1, STATE2)
	expect(commands.length).toEqual(1)

	expect(commands[0].rawName).toEqual('CSSc')
	expect(commands[0].flag).toEqual(5)
	expect(commands[0].properties).toMatchObject({
		artFillSource: 3010,
		artOption: 1
	})

	STATE2.video.superSources[0].properties.artFillSource = STATE1.video.superSources[0].properties.artFillSource
	STATE2.video.superSources[0].properties.artOption = STATE1.video.superSources[0].properties.artOption
})
test('Unit: super source properties v8: no properties changed', function () {
	const commands = supersource.resolveSuperSourceState(STATE1, STATE2, Enums.ProtocolVersion.V8_0)
	expect(commands.length).toEqual(0)
})

test('Unit: super source border v8: some properties changed', function () {
	STATE2.video.superSources[0].border.borderOuterWidth = 3010
	STATE2.video.superSources[0].border.borderEnabled = true
	const commands = supersource.resolveSuperSourceBorderV8State(STATE1, STATE2)
	expect(commands.length).toEqual(1)

	expect(commands[0].rawName).toEqual('CSBd')
	expect(commands[0].flag).toEqual(5)
	expect(commands[0].properties).toMatchObject({
		borderOuterWidth: 3010,
		borderEnabled: true
	})

	STATE2.video.superSources[0].border.borderOuterWidth = STATE1.video.superSources[0].border.borderOuterWidth
	STATE2.video.superSources[0].border.borderEnabled = STATE1.video.superSources[0].border.borderEnabled
})

test('Unit: super source box v8: 2 super sources', function () {
	STATE1.video.superSources[1] = JSON.parse(JSON.stringify(STATE1.video.superSources[0]))
	STATE2.video.superSources[1] = JSON.parse(JSON.stringify(STATE1.video.superSources[0]))
	STATE2.video.superSources[1].boxes[0].cropped = false
	const commands = supersource.resolveSuperSourceBoxState(STATE1, STATE2, Enums.ProtocolVersion.V8_0)
	expect(commands.length).toEqual(1)

	expect(commands[0].rawName).toEqual('CSBP')
	expect(commands[0].flag).toEqual(32)
	expect((commands[0] as SuperSourceBoxParametersCommand).ssrcId).toEqual(1)
	expect(commands[0].properties).toMatchObject({
		cropped: false
	})

	STATE2.video.superSources[1].boxes[0].cropped = true
})
