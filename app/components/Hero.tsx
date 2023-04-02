import { formatRuntime } from "~/utils/format";
import styles from "./Hero.module.scss";

function Show({ when, children }: { when: any; children: any }) {
	return when ? children : null;
}

export function Hero(props: { item: any }) {
	const stars = () =>
		props.item.vote_average ? props.item.vote_average * 10 : 0;
	const name = () => (props.item.title ? props.item.title : props.item.name);
	const yearStart = () => {
		const date = props.item.release_date || props.item.first_air_date;
		if (date) {
			return date.split("-")[0];
		}
	};

	return (
		<div>
			<div className={styles.hero}>
				<div className={styles.backdrop}>
					<div>
						<Show when={props.item.trailer}>
							<button
								className={styles.play}
								type="button"
								aria-label="Play Trailer"
							>
								{/* <CirclePlayIcon /> */}
							</button>
						</Show>
						<picture>
							<source
								srcSet={`https://image.tmdb.org/t/p/w1280${props.item.backdrop_path}`}
								media="(min-width: 780px)"
							/>
							<source
								srcSet={`https://image.tmdb.org/t/p/w780${props.item.backdrop_path}`}
								media="(min-width: 300px)"
							/>
							<img
								alt={props.item.title || props.item.name}
								className={styles.image}
								style={{
									height: "100%",
								}}
								src={`https://image.tmdb.org/t/p/w300${props.item.backdrop_path}`}
							/>
						</picture>
						{/* <img
              // src={"https://image.tmdb.org/t/p/original" + props.item.backdrop_path}
              src={`https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${props.item.backdrop_path}`}
              alt=""
              className={styles.image}
              style={{
                height: "100%"
              }}
            /> */}
						{/* <nuxt-picture
        className="$style.image"
        sizes="xsmall:100vw medium:71.1vw"
        :alt="name"
        :src="backdrop" /> */}
					</div>
				</div>

				<div className={styles.pane}>
					<div>
						<h1 className={styles.name}>
							{name()}

							{/* <template >
          <A to="{ name: `${type}-id`, params: { id: item.id } }">
            { props.item.name }
          </A>
        </template> */}
						</h1>
						<div className={styles.meta}>
							<div className={styles.rating}>
								<Show when={stars()}>
									<div className={styles.stars}>
										<div style={{ width: `${stars()}%` }} />
									</div>
								</Show>

								<Show when={props.item.vote_count > 0}>
									<div>{props.item.vote_count} Reviews</div>
								</Show>
							</div>

							<div className={styles.info}>
								<Show when={props.item.number_of_seasons}>
									<span>Season {props.item.number_of_seasons}</span>
								</Show>
								<Show when={yearStart()}>
									<span>{yearStart()}</span>
								</Show>
								<Show when={props.item.runtime}>
									<span>{formatRuntime(props.item.runtime)}</span>
								</Show>
								{/* <span>Cert. {{ cert }}</span> */}
							</div>
						</div>
						<div className={styles.desc}>{props.item.overview}</div>
					</div>
					{/* <transition
        appear
        name="hero">
        <div>
          <h1 className="$style.name">
            <template>
              {{ name }}
            </template>

            <template >
              <nuxt-link :to="{ name: `${type}-id`, params: { id: item.id } }">
                {{ name }}
              </nuxt-link>
            </template>
          </h1>

          <div className="$style.meta">
            <div

              className="$style.rating">
              <div

                className="$style.stars">
                <div :style="{ width: `${stars}%` }" />
              </div>

              <div>
                {{ item.vote_count | numberWithCommas }} Reviews
              </div>
            </div>

            <div className="$style.info">
              <span >Season {{ item.number_of_seasons }}</span>
              <span>{{ yearStart }}</span>
              <span >{{ item.runtime | runtime }}</span>
              <span>Cert. {{ cert }}</span>
            </div>
          </div>

          <div className="$style.desc">
            {{ item.overview | truncate(200) }}
          </div>

          <button
            className="button button--icon"
            className="$style.trailer"
            type="button"
            onClick="openModal">
            <PlayIcon className="icon" />
            <span className="txt">Watch Trailer</span>
          </button>
        </div> */}
				</div>
			</div>
		</div>
	);
}

export default Hero;
