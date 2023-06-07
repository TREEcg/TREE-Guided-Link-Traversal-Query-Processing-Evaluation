use std::path::PathBuf;

use lazy_static;
use serde::Deserialize;
use std::fs;

#[derive(Deserialize, Debug)]
pub struct TestSummary {
    pub queries: Vec<QueryEntry>,
    pub n_repetition: usize,
    pub config: String,
}

#[derive(Deserialize, Debug)]
pub struct Result {
    pub avg: f32,
    pub var: f32,
    pub min: f32,
    pub max: f32,
}

#[derive(Deserialize, Debug)]
pub struct QueryEntry {
    pub filter_expression: String,
    pub number_result: Result,
    pub time_exec_last_result: Result,
    pub number_request: Result,
}

impl TestSummary {
    pub fn new(path: &PathBuf) -> Self {
        let serialized =
            fs::read_to_string(path).expect(format!("was not able to read {path:?}").as_str());
        let test_summary: TestSummary = serde_json::from_str(&serialized).unwrap();
        test_summary
    }
}

pub fn get_all_tests_bench_folder(root_path: &PathBuf) -> Vec<PathBuf> {
    let mut res: Vec<PathBuf> = Vec::new();
    let paths = fs::read_dir(root_path).expect(
        format!("was not able to find the root directory of the bench test: {root_path:?}")
            .as_str(),
    );

    for path in paths {
        let entry = path.unwrap();
        let file_type = entry.file_type().unwrap();
        if file_type.is_dir() {
            res.push(entry.path())
        }
    }
    res
}

pub fn get_test_benches(path: &PathBuf) -> Vec<TestSummary> {
    let mut resp: Vec<TestSummary> = Vec::new();
    lazy_static::lazy_static! {
        static ref DATA_FILES:[&'static str; 3] = [
            "config_comunica_follow_tree_solver.json",
            "config_comunica_follow_tree.json",
            "config_comunica_follow_all.json",
        ];
    }
    for file in DATA_FILES.into_iter() {
        let file_path = {
            let mut temp = path.clone();
            temp.push(file);
            temp
        };
        resp.push(TestSummary::new(&file_path));
    }

    resp
}