use std::path::PathBuf;

use gnuplot::AxesCommon;
use gnuplot::Graph;
use gnuplot::{Caption, Figure};
mod fetching_result;
use fetching_result::*;
fn main() {
    let root_test_cases = PathBuf::from("../benchmark/results");
    let test_cases = get_all_tests_bench_folder(&root_test_cases);
    let test_benches = get_test_benches(&test_cases[0]);
    println!("{test_cases:?}");
    println!("{test_benches:?}");
    let mut fg = Figure::new();
    fg.axes2d()
        .set_title("A plot", &[])
        .set_legend(Graph(0.5), Graph(0.9), &[], &[])
        .set_x_label("x", &[])
        .set_y_label("y^2", &[])
        .lines(
            &[-3., -2., -1., 0., 1., 2., 3.],
            &[9., 4., 1., 0., 1., 4., 9.],
            &[Caption("Parabola")],
        );
    fg.show().unwrap();
}
