import styled from "@emotion/styled";
import {
	FastForwardRounded as ForwardIcon,
	FastRewindRounded as RewindIcon,
	PauseRounded as PauseIcon,
	PlayArrowRounded as PlayIcon,
	MoreVertRounded as SettingsIcon,
	Close as CloseIcon
} from "@mui/icons-material";
import {
	Box,
	Card,
	CardContent,
	Checkbox,
	Grow,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Paper,
	Slider,
	SliderThumb,
	SliderTrack,
	Theme,
	Typography
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import RendererController from "../render/renderer_controller";

interface AnimationControlsProps {
	rendererController: RendererController;
}

interface PlaybackControlsProps {
	rendererController: RendererController;
	showMenu: boolean;
	onToggleMenu: (evt: React.MouseEvent) => void;
}

interface AnimationMenuProps {
	rendererController: RendererController;
}

const NoTransitionThumb = styled(SliderThumb)`
	transition: box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
		bottom 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
`;

const NoTransitionTrack = styled(SliderTrack)`
	transition: left 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
		bottom 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
		height 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
`;

const PlaybackControls = ({
	rendererController,
	showMenu,
	onToggleMenu
}: PlaybackControlsProps) => {
	const [playing, setPlaying] = useState(rendererController.playing);
	const [time, setTime] = useState(rendererController.animationTime);

	useEffect(() => {
		rendererController.onChange("player", () => {
			setPlaying(rendererController.playing);
			setTime(rendererController.animationTime);
		});
	}, [rendererController, time]);

	const onPlayClick = useCallback(() => {
		if (playing) rendererController.pause();
		else {
			if (time === 1) rendererController.setAnimationTime(0);
			rendererController.play();
		}
	}, [playing, rendererController, time]);

	const onRewindClick = useCallback(() => {
		rendererController.setAnimationTime(0);
	}, [rendererController]);

	const onForwardClick = useCallback(() => {
		rendererController.setAnimationTime(1);
	}, [rendererController]);

	const onSeek = useCallback(
		(_, newTime: number) => {
			rendererController.setAnimationTime(newTime);
		},
		[rendererController]
	);

	let components = {};
	if (playing) {
		components = {
			Thumb: NoTransitionThumb,
			Track: NoTransitionTrack
		};
	}

	return (
		<Paper
			sx={(theme) => ({
				padding: theme.spacing(0, 1),
				fontSize: "50px",
				lineHeight: 1,
				display: "flex",
				width: "800px",
				maxWidth: "95vw",
				alignItems: "center"
			})}
		>
			<IconButton onClick={onPlayClick}>
				{playing ? (
					<PauseIcon fontSize="large" />
				) : (
					<PlayIcon fontSize="large" />
				)}
			</IconButton>
			<IconButton onClick={onRewindClick}>
				<RewindIcon fontSize="large" />
			</IconButton>
			<IconButton onClick={onForwardClick}>
				<ForwardIcon fontSize="large" />
			</IconButton>
			<Slider
				value={time}
				min={0}
				max={1}
				step={0.001}
				onChange={onSeek}
				sx={(theme: Theme) => ({
					flex: 1,
					marginLeft: theme.spacing(2),
					marginRight: theme.spacing(3)
				})}
				components={components}
			/>
			<IconButton onClick={onToggleMenu}>
				{showMenu ? (
					<CloseIcon fontSize="large" />
				) : (
					<SettingsIcon fontSize="large" />
				)}
			</IconButton>
		</Paper>
	);
};

const AnimationMenu = ({ rendererController }: AnimationMenuProps) => {
	const [axesShown, setAxesShown] = useState(rendererController.axesShown);
	console.log(axesShown);
	rendererController.onChange("settings", () => {
		setAxesShown(rendererController.axesShown);
	});
	return (
		<Card sx={{ maxWidth: "400px" }}>
			<CardContent>
				<Typography gutterBottom variant="h5" component="header">
					Animation Settings
				</Typography>
				<List>
					<ListItem>
						<ListItemText>Show coordinate axes</ListItemText>
						<Checkbox
							checked={axesShown}
							onChange={(evt) =>
								rendererController.setAxesShown(evt.target.checked)
							}
						/>
					</ListItem>
				</List>
			</CardContent>
		</Card>
	);
};

const AnimationControls = ({ rendererController }: AnimationControlsProps) => {
	const [showMenu, setShowMenu] = useState(false);
	const onToggleMenu = useCallback((evt: React.MouseEvent) => {
		setShowMenu((shown) => !shown);
	}, []);

	return (
		<Box display="flex" flexDirection="column" alignItems="flex-end">
			<Grow in={showMenu}>
				<Box mb={2}>
					<AnimationMenu rendererController={rendererController} />
				</Box>
			</Grow>
			<PlaybackControls
				rendererController={rendererController}
				showMenu={showMenu}
				onToggleMenu={onToggleMenu}
			/>
		</Box>
	);
};

export default AnimationControls;
