#ifndef		SDLDATA_H
#define		SDLDATA_H

#include	"SDLazy.h"
#include	"sdldata_typedef.h"
#include	"ammo.h"

enum
{
  BG0,
  NB_BGS
};

enum
{
  SRF_SHIP_NO, SRF_SHIP_NE, SRF_SHIP_SO, SRF_SHIP_SE,
  SRF_SHIP_AN_TURRET,
  NB_SRFS
};

struct			SDLData
{
  SDLazy_Surface*	srf_bgs[NB_BGS];
  SDLazy_Surface*	srf_ship[NB_SRFS];
  SDLazy_Surface*	srf_bullets[NB_AMMOS];
  v2f			cam;
};

void		sdldata_init(SDLData*);

#endif
